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

// Типы
import { DailyReward, ServerError } from "@/types/types";
import { toast } from "sonner";

const DailyRewardPage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<DailyReward | null>(null);

  // Загрузка наград
  useEffect(() => {
    admin.getDailyRewards().catch((err) => {
      const serverError = err as ServerError;
      console.error("Ошибка при загрузке DailyRewards:", err);
      toast.error(serverError?.response?.data?.message || "Ошибка при загрузке ежедневных наград");
    });
  }, [admin]);

  // "Добавить награду"
  const handleAddClick = () => {
    setSelectedReward(null);
    setOpenDialog(true);
  };

  // "Изменить награду"
  const handleEditClick = (reward: DailyReward) => {
    setSelectedReward(reward);
    setOpenDialog(true);
  };

  // Сохранение (добавление или редактирование)
  const handleSave = async () => {
    if (!selectedReward) return;

    try {
      // Если есть id, обновляем по day
      if (selectedReward.id) {
        await admin.updateDailyRewardByDay(selectedReward.day, {
          reward: selectedReward.reward,
          rewardType: selectedReward.rewardType,
          description: selectedReward.description,
        } as DailyReward);
        toast.success("Награда успешно обновлена");
      } else {
        // Создаём новую
        await admin.createDailyReward({
          day: selectedReward.day,
          reward: selectedReward.reward,
          rewardType: selectedReward.rewardType,
          description: selectedReward.description,
        } as DailyReward);
        toast.success("Награда успешно создана");
      }

      // Обновляем список
      await admin.getDailyRewards();
      setOpenDialog(false);
      setSelectedReward(null);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при сохранении DailyReward:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при сохранении награды");
    }
  };

  // Меняем поля формы
  const handleChangeField = (field: keyof DailyReward, value: string) => {
    if (!selectedReward) {
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

      {/* Таблица */}
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

      {/* Диалог */}
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
            <div>
              <Label htmlFor="rewardType">Тип награды</Label>
              <Input
                id="rewardType"
                value={selectedReward?.rewardType || ""}
                onChange={(e) => handleChangeField("rewardType", e.target.value)}
                placeholder="attempts или tokens"
              />
            </div>
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
