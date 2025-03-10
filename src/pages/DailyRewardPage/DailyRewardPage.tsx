"use client";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";

// Компоненты shadcn/ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Тип, соответствующий сущности DailyReward
import { DailyReward } from "@/types/types";

const DailyRewardPage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<DailyReward | null>(null);

  // Загрузка всех наград при монтировании
  useEffect(() => {
    admin.getDailyRewards();
  }, [admin]);

  // "Добавить награду"
  const handleAddClick = () => {
    setSelectedReward(null); // диалог будет пустой
    setOpenDialog(true);
  };

  // "Изменить награду"
  const handleEditClick = (reward: DailyReward) => {
    setSelectedReward(reward);
    setOpenDialog(true);
  };

  // Сохранение награды (новой или уже существующей)
  const handleSave = async () => {
    if (!selectedReward) return;

    try {
      if (selectedReward.id) {
        // Если награда уже существует (есть id):
        // обновляем по day (на бэке updateDailyRewardByDay принимает в URL day)
        await admin.updateDailyRewardByDay(selectedReward.day, {
          // Объект без day: day указывается в URL
          reward: selectedReward.reward,
          rewardType: selectedReward.rewardType,
          description: selectedReward.description,
        } as DailyReward);
      } else {
        // Иначе создаём новую награду
        await admin.createDailyReward({
          // Здесь day обязателен, так как бэк создает запись конкретно на этот день
          day: selectedReward.day,
          reward: selectedReward.reward,
          rewardType: selectedReward.rewardType,
          description: selectedReward.description,
          // id не передаём: он сгенерируется
        } as DailyReward);
      }

      // Перезагружаем список, закрываем диалог
      await admin.getDailyRewards();
      setOpenDialog(false);
      setSelectedReward(null);
    } catch (error) {
      console.error("Ошибка при сохранении DailyReward:", error);
    }
  };

  // Меняем поля формы
  const handleChangeField = (field: keyof DailyReward, value: string) => {
    if (!selectedReward) {
      // Создаём новый объект для формы
      setSelectedReward({
        ...({} as DailyReward),
        [field]: field === "day" || field === "reward" ? Number(value) : value,
      });
    } else {
      setSelectedReward({
        ...selectedReward,
        [field]: field === "day" || field === "reward" ? Number(value) : value,
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Управление ежедневными наградами</h1>

      {/* Кнопка "Добавить награду" */}
      <Button onClick={handleAddClick} className="mb-4">
        Добавить награду
      </Button>

      {/* Таблица с наградами */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>День (1..7)</TableHead>
            <TableHead>Размер награды</TableHead>
            <TableHead>Тип (attempts / tokens)</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admin.dailyRewards.map((dr) => (
            <TableRow key={dr.id}>
              <TableCell>{dr.id}</TableCell>
              <TableCell>{dr.day}</TableCell>
              <TableCell>{dr.reward}</TableCell>
              <TableCell>{dr.rewardType}</TableCell>
              <TableCell>{dr.description}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" onClick={() => handleEditClick(dr)}>
                  Изменить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Диалог для редактирования/добавления */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReward?.id ? "Редактировать награду" : "Добавить награду"}
            </DialogTitle>
            <DialogDescription>
              Заполните поля ниже и нажмите «Сохранить».
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* day */}
            <div>
              <Label htmlFor="day">День (1..7)</Label>
              <Input
                id="day"
                type="number"
                value={selectedReward?.day ?? ""}
                onChange={(e) => handleChangeField("day", e.target.value)}
                placeholder="Например: 1"
              />
            </div>

            {/* reward */}
            <div>
              <Label htmlFor="reward">Размер награды</Label>
              <Input
                id="reward"
                type="number"
                value={selectedReward?.reward ?? ""}
                onChange={(e) => handleChangeField("reward", e.target.value)}
                placeholder="Например: 10"
              />
            </div>

            {/* rewardType */}
            <div>
              <Label htmlFor="rewardType">Тип награды</Label>
              <Input
                id="rewardType"
                value={selectedReward?.rewardType || ""}
                onChange={(e) => handleChangeField("rewardType", e.target.value)}
                placeholder="attempts или tokens"
              />
            </div>

            {/* description */}
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={selectedReward?.description || ""}
                onChange={(e) => handleChangeField("description", e.target.value)}
                placeholder="Например: Заходи каждый день..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default DailyRewardPage;
