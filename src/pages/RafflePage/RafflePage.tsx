"use client";

import React, { useContext, useEffect, useState, ChangeEvent } from "react";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";

// Компоненты из shadcn/ui
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

// Импортируем toast из sonner
import { toast } from "sonner";
// Типы
import { ServerError, RafflePrize } from "@/types/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const RafflePage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  // --- Состояния для диалога ---
  const [dialogOpen, setDialogOpen] = useState(false);

  // Если editPrizeId == null → создаём новый приз,
  // иначе редактируем существующий.
  const [editPrizeId, setEditPrizeId] = useState<number | null>(null);

  const [prizeName, setPrizeName] = useState("");
  const [prizeValue, setPrizeValue] = useState<number>(0);
  const [prizeDescription, setPrizeDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // --- Состояния для кнопок ---
  const [isCompletingRaffle, setIsCompletingRaffle] = useState(false);
  const [isSavingPrize, setIsSavingPrize] = useState(false);
  const [assigningPrizeId, setAssigningPrizeId] = useState<number | null>(null);

  // Загружаем розыгрыш и призы при монтировании
  useEffect(() => {
    admin.getCurrentRaffle().catch((err) => {
      console.error(err);
      toast.error("Ошибка при загрузке текущего розыгрыша");
    });
    admin.getAllPrizes().catch((err) => {
      console.error(err);
      toast.error("Ошибка при загрузке призов");
    });
  }, [admin]);

  // Проверяем, есть ли реально активный розыгрыш
  const currentRaffle = admin.currentRaffle;
  const hasActiveRaffle = currentRaffle && !("message" in currentRaffle);

  // --- Завершить розыгрыш ---
  const handleCompleteRaffle = async () => {
    try {
      setIsCompletingRaffle(true);
      await admin.completeRaffle();
      toast.success("Розыгрыш завершён");
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при завершении розыгрыша:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при завершении розыгрыша");
    } finally {
      setIsCompletingRaffle(false);
    }
  };

  // --- Назначить приз для текущего розыгрыша ---
  const handleSetPrize = async (prizeId: number) => {
    try {
      setAssigningPrizeId(prizeId);
      await admin.setRafflePrize(prizeId);
      await admin.getCurrentRaffle();
      toast.success("Приз назначен для текущего розыгрыша");
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при назначении приза:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при назначении приза");
    } finally {
      setAssigningPrizeId(null);
    }
  };

  // --- Создание / редактирование приза ---
  const handleOpenCreatePrize = () => {
    // Сбрасываем поля формы (создание)
    setEditPrizeId(null);
    setPrizeName("");
    setPrizeValue(0);
    setPrizeDescription("");
    setImageFile(null);
    setDialogOpen(true);
  };

  // Открыть форму редактирования конкретного приза
  const handleEditPrize = (prize: RafflePrize) => {
    setEditPrizeId(prize.id);
    setPrizeName(prize.name);
    setPrizeValue(prize.value);
    setPrizeDescription(prize.description || "");
    setImageFile(null); // пока не выбирали новый файл
    setDialogOpen(true);
  };

  // При выборе файла
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Проверка размера
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Максимальный размер файла: 15MB");
        return;
      }
      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  // Сохранить приз (новый или отредактированный)
  const handleSavePrize = async () => {
    try {
      setIsSavingPrize(true);

      // Валидация
      if (!prizeName.trim()) {
        toast.error("Введите название приза");
        return;
      }
      if (!prizeValue) {
        toast.error("Введите стоимость приза (value)");
        return;
      }

      // FormData
      const formData = new FormData();
      formData.append("name", prizeName);
      formData.append("value", prizeValue.toString());
      formData.append("description", prizeDescription);
      if (imageFile) {
        // Если пользователь выбрал новый файл
        formData.append("image", imageFile);
      }

      // Если editPrizeId → обновляем, иначе → создаём
      if (editPrizeId) {
        await admin.updatePrize(editPrizeId, formData);
        toast.success("Приз успешно обновлён");
      } else {
        await admin.createPrize(formData);
        toast.success("Приз успешно создан");
      }

      // Обновляем список
      await admin.getAllPrizes();
      setDialogOpen(false);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при сохранении приза:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при сохранении приза");
    } finally {
      setIsSavingPrize(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Управление розыгрышем</h1>

      {/* Текущий розыгрыш */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold">Текущий розыгрыш:</h2>
        {hasActiveRaffle ? (
          <div className="mt-2 border p-3 rounded">
            <p>ID: {currentRaffle.raffle.id}</p>
            <p>Статус: {currentRaffle.raffle.status}</p>
            <p>Всего билетов: {currentRaffle.raffle.totalTickets}</p>
            <p>
              Приз:{" "}
              {currentRaffle.raffle.raffle_prize
                ? currentRaffle.raffle.raffle_prize.name
                : "Не назначен"}
            </p>
            <Button
              className="mt-2"
              variant="outline"
              onClick={handleCompleteRaffle}
              disabled={isCompletingRaffle}
            >
              {isCompletingRaffle ? "Завершаем..." : "Завершить розыгрыш"}
            </Button>
          </div>
        ) : (
          <p className="mt-2">Сейчас нет активного розыгрыша.</p>
        )}
      </section>

      {/* Список призов */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Список призов</h2>
          <Button onClick={handleOpenCreatePrize}>Добавить приз</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Стоимость</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Изображение</TableHead>
              <TableHead className="text-right">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admin.prizes.map((prize) => {
              const isAssigningThisPrize = assigningPrizeId === prize.id;
              return (
                <TableRow key={prize.id}>
                  <TableCell>{prize.id}</TableCell>
                  <TableCell>{prize.name}</TableCell>
                  <TableCell>{prize.value}</TableCell>
                  <TableCell>{prize.description}</TableCell>
                  <TableCell>
                    {prize.imageUrl ? (
                      <img
                        src={prize.imageUrl}
                        alt={prize.name}
                        className="h-10"
                      />
                    ) : (
                      "Нет"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Кнопка "Назначить" (только если есть активный розыгрыш) */}
                    {hasActiveRaffle && (
                      <Button
                        variant="outline"
                        onClick={() => handleSetPrize(prize.id)}
                        disabled={isAssigningThisPrize}
                      >
                        {isAssigningThisPrize ? "Назначаем..." : "Назначить"}
                      </Button>
                    )}
                    {/* Кнопка "Изменить" */}
                    <Button
                      variant="outline"
                      className="ml-2"
                      onClick={() => handleEditPrize(prize)}
                    >
                      Изменить
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      {/* Диалог (создание/редактирование) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>{editPrizeId ? "Редактировать приз" : "Создать приз"}</DialogTitle>
            <DialogDescription>
              Заполните поля и при необходимости загрузите новый файл изображения (до 15MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Название</Label>
              <Input
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="Например: Red Cap"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Стоимость (value)</Label>
              <Input
                type="number"
                value={prizeValue}
                onChange={(e) => setPrizeValue(Number(e.target.value))}
                placeholder="Например: 1000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Описание</Label>
              <Textarea
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                placeholder="Короткое описание..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Изображение (до 15MB)</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {imageFile && (
                <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
                  Выбран файл: {imageFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSavePrize} disabled={isSavingPrize}>
              {isSavingPrize
                ? editPrizeId
                  ? "Обновляем..."
                  : "Создаём..."
                : editPrizeId
                ? "Обновить"
                : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default RafflePage;
