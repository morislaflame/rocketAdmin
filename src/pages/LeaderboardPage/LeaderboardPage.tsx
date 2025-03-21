import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "@/main";
import { IStoreContext } from "@/store/StoreProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ServerError } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaderboardData, LeaderboardSettings } from "@/types/types";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const LeaderboardPage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  // Состояния для данных
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Состояния для формы настроек
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [prizeType, setPrizeType] = useState<'money' | 'physical'>('money');
  const [totalMoneyPool, setTotalMoneyPool] = useState<number>(0);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [placePrizes, setPlacePrizes] = useState<Record<string, { moneyAmount?: number; rafflePrizeId?: number }>>({});

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Загружаем данные лидерборда
        const data = await admin.getLeaderboard();
        setLeaderboardData(data);
        
        // Загружаем список доступных призов
        await admin.getAllPrizes();
        
      } catch (error) {
        console.error("Ошибка при загрузке данных лидерборда:", error);
        toast.error("Не удалось загрузить данные лидерборда");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [admin]);

  // Обработчик открытия формы настроек
  const handleOpenSettings = () => {
    // Если есть активные настройки, используем их для заполнения формы
    if (leaderboardData?.settings && "isActive" in leaderboardData.settings && leaderboardData.settings.isActive) {
      const settings = leaderboardData.settings as LeaderboardSettings;
      setPrizeType(settings.prizeType);
      setTotalMoneyPool(settings.totalMoneyPool || 0);
      
      if (settings.endDate) {
        setEndDate(new Date(settings.endDate));
      } else {
        setEndDate(undefined);
      }
      
      // Заполняем призы по местам
      const prizes: Record<string, { moneyAmount?: number; rafflePrizeId?: number }> = {};
      settings.placePrizes.forEach(prize => {
        prizes[prize.place.toString()] = {
          moneyAmount: prize.moneyAmount || undefined,
          rafflePrizeId: prize.rafflePrizeId || undefined
        };
      });
      setPlacePrizes(prizes);
    } else {
      // Значения по умолчанию для новых настроек
      setPrizeType('money');
      setTotalMoneyPool(10000);
      setEndDate(undefined);
      setPlacePrizes({
        "1": { moneyAmount: 5000 },
        "2": { moneyAmount: 3000 },
        "3": { moneyAmount: 2000 }
      });
    }
    
    setSettingsDialogOpen(true);
  };

  // Обработчик изменения приза для места
  const handleChangePrize = (place: string, value: number | string, field: 'moneyAmount' | 'rafflePrizeId') => {
    setPlacePrizes(prev => ({
      ...prev,
      [place]: {
        ...prev[place],
        [field]: field === 'moneyAmount' ? Number(value) : value
      }
    }));
  };

  // Обработчик добавления нового места
  const handleAddPlace = () => {
    const nextPlace = Object.keys(placePrizes).length + 1;
    setPlacePrizes(prev => ({
      ...prev,
      [nextPlace.toString()]: prizeType === 'money' 
        ? { moneyAmount: 0 } 
        : { rafflePrizeId: undefined }
    }));
  };

  // Обработчик удаления места
  const handleRemovePlace = (place: string) => {
    const updatedPrizes = { ...placePrizes };
    delete updatedPrizes[place];
    
    // Переиндексируем места
    const newPrizes: typeof placePrizes = {};
    Object.entries(updatedPrizes)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach((entry, index) => {
        newPrizes[(index + 1).toString()] = entry[1];
      });
    
    setPlacePrizes(newPrizes);
  };

  // Обработчик сохранения настроек
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Проверка на корректность заполнения призов
      if (prizeType === 'money') {
        const totalAllocated = Object.values(placePrizes).reduce(
          (sum, prize) => sum + (prize.moneyAmount || 0), 0
        );
        
        if (totalAllocated > totalMoneyPool) {
          toast.error(`Сумма призов (${totalAllocated}) превышает общий фонд (${totalMoneyPool})`);
          return;
        }
        
        // Проверка, что все места имеют денежные значения
        for (const [place, prize] of Object.entries(placePrizes)) {
          if (!prize.moneyAmount || prize.moneyAmount <= 0) {
            toast.error(`Место ${place} должно иметь положительную денежную сумму`);
            return;
          }
        }
      } else {
        // Проверка, что все места имеют выбранные призы
        for (const [place, prize] of Object.entries(placePrizes)) {
          if (!prize.rafflePrizeId) {
            toast.error(`Необходимо выбрать приз для места ${place}`);
            return;
          }
        }
      }
      
      // Отправка данных на сервер
      await admin.updateLeaderboardSettings({
        endDate: endDate,
        prizeType,
        totalMoneyPool: prizeType === 'money' ? totalMoneyPool : undefined,
        placePrizes
      });
      
      // Обновляем отображаемые данные
      const updatedData = await admin.getLeaderboard();
      setLeaderboardData(updatedData);
      
      toast.success("Настройки лидерборда успешно обновлены");
      setSettingsDialogOpen(false);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при сохранении настроек:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при сохранении настроек");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Загрузка данных лидерборда...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Управление лидербордом</h1>

      {/* Текущие настройки лидерборда */}
      <section className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Текущие настройки лидерборда:</h2>
          <Button onClick={handleOpenSettings}>
            {leaderboardData?.settings && "isActive" in leaderboardData.settings && leaderboardData.settings.isActive 
              ? "Изменить настройки" 
              : "Создать настройки"}
          </Button>
        </div>

        {leaderboardData?.settings &&
        "isActive" in leaderboardData.settings &&
        leaderboardData.settings.isActive ? (
        // Здесь мы знаем, что settings имеет тип LeaderboardSettings
        (() => {
            const settings = leaderboardData.settings as LeaderboardSettings;
            return (
            <div className="mt-2 border p-3 rounded">
                <p>Тип призов: {settings.prizeType === 'money' ? 'TON' : 'Гифт'}</p>
                {settings.totalMoneyPool && (
                <p>Общий призовой фонд: {settings.totalMoneyPool}</p>
                )}
                <p>
                Дата окончания:{" "}
                {settings.endDate
                    ? new Date(settings.endDate).toLocaleDateString()
                    : 'Не указана'}
                </p>

                <h3 className="font-semibold mt-3">Призы по местам:</h3>
                <div className="mt-1">
                {settings.placePrizes
                    .sort((a, b) => a.place - b.place)
                    .map(prize => (
                    <div key={prize.id} className="flex gap-2 items-center">
                        <span className="font-medium">{prize.place} место:</span>
                        {settings.prizeType === 'money' ? (
                        <span>{prize.moneyAmount} TON</span>
                        ) : (
                        <span>{prize.rafflePrize?.name}</span>
                        )}
                    </div>
                    ))}
                </div>
            </div>
            );
        })()
        ) : (
        <div className="mt-2 text-slate-500">
            Активные настройки лидерборда отсутствуют
        </div>
        )}

      </section>

      {/* Текущий топ пользователей */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Топ пользователей:</h2>
        
        <div className="border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Место</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead className="text-right">Баланс</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData?.users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{user.username || `ID: ${user.id}`}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{user.balance}</TableCell>
                </TableRow>
              ))}
              
              {(!leaderboardData?.users || leaderboardData.users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-slate-500">
                    Нет данных для отображения
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Диалог настроек лидерборда */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Настройки лидерборда</DialogTitle>
            <DialogDescription>
              Настройте тип призов, сумму призового фонда и распределение по местам.
            </DialogDescription>
          </DialogHeader>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Тип призов</Label>
              <Select 
                value={prizeType} 
                onValueChange={(value: 'money' | 'physical') => setPrizeType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип призов" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="money">TON</SelectItem>
                  <SelectItem value="physical">Гифт</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {prizeType === 'money' && (
              <div className="flex flex-col gap-2">
                <Label>Общий призовой фонд (TON)</Label>
                <Input
                  type="number"
                  value={totalMoneyPool}
                  onChange={(e) => setTotalMoneyPool(Number(e.target.value))}
                  placeholder="Например: 10000"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Дата окончания (необязательно)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? endDate.toLocaleDateString() : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
              {endDate && (
                <Button 
                  variant="ghost" 
                  className="mt-1" 
                  onClick={() => setEndDate(undefined)}
                >
                  Очистить дату
                </Button>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">Призы по местам</Label>
                <Button size="sm" onClick={handleAddPlace}>Добавить место</Button>
              </div>
              
              {prizeType === 'money' ? (
                // Для денежных призов показываем поля ввода для каждого места
                Object.entries(placePrizes)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([place, prize]) => (
                  <div key={place} className="flex gap-2 items-center mt-2">
                    <span className="w-14">{place} место:</span>
                    <Input
                      type="number"
                      className="flex-1"
                      value={prize.moneyAmount || 0}
                      onChange={(e) => handleChangePrize(place, e.target.value, 'moneyAmount')}
                      placeholder="Сумма"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleRemovePlace(place)}
                    >
                      X
                    </Button>
                  </div>
                ))
              ) : (
                // Для физических призов показываем таблицу всех доступных призов
                <div className="mt-2 border rounded overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Место</TableHead>
                        <TableHead>Приз</TableHead>
                        <TableHead className="w-16">Выбрать</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(placePrizes)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([place, prize]) => (
                        <TableRow key={place}>
                          <TableCell className="font-medium">{place}</TableCell>
                          <TableCell>
                            <Select 
                              value={prize.rafflePrizeId?.toString() || ""} 
                              onValueChange={(value) => handleChangePrize(place, Number(value), 'rafflePrizeId')}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите приз" />
                              </SelectTrigger>
                              <SelectContent>
                                {admin.prizes && admin.prizes.length > 0 ? (
                                  admin.prizes.map(prizeItem => (
                                    <SelectItem key={prizeItem.id} value={prizeItem.id.toString()}>
                                      {prizeItem.name} ({prizeItem.value})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem disabled value="none">Нет доступных призов</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemovePlace(place)}
                            >
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {Object.keys(placePrizes).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-slate-500">
                            Нет добавленных мест. Используйте кнопку "Добавить место".
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить настройки"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default LeaderboardPage;