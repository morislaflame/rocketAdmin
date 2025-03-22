"use client";

import React, { useContext, useEffect, useState, ChangeEvent } from "react";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";
import Lottie from "lottie-react";

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

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const RafflePage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  // Состояния для диалога
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPrizeId, setEditPrizeId] = useState<number | null>(null);
  const [prizeName, setPrizeName] = useState("");
  const [prizeValue, setPrizeValue] = useState<number>(0);
  const [prizeDescription, setPrizeDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Состояния для кнопок
  const [isSavingPrize, setIsSavingPrize] = useState(false);
  const [assigningPrizeId, setAssigningPrizeId] = useState<number | null>(null);

  // Состояния для настроек розыгрыша
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [ticketThreshold, setTicketThreshold] = useState<number>(50);
  const [raffleDuration, setRaffleDuration] = useState<number>(240);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Состояние для анимаций
  const [animations, setAnimations] = useState<{ [url: string]: Record<string, unknown> }>({});

  // Загружаем розыгрыш и призы при монтировании
  useEffect(() => {
    admin.getCurrentRaffle().then(raffle => {
      if (raffle && !("message" in raffle)) {
        setTicketThreshold(raffle.raffle.ticketThreshold || 50);
        setRaffleDuration((raffle.raffle.raffleDuration || 4 * 60 * 60 * 1000) / (60 * 1000));
      }
    }).catch((err) => {
      console.error(err);
      toast.error("Ошибка при загрузке текущего розыгрыша");
    });
    
    admin.getAllPrizes().catch((err) => {
      console.error(err);
      toast.error("Ошибка при загрузке призов");
    });
  }, [admin]);

  // Загружаем анимации для призов
  useEffect(() => {
    const loadAnimations = async () => {
      const newAnimations: { [url: string]: Record<string, unknown> } = {};
      for (const prize of admin.prizes) {
        const mediaFile = prize.media_file;
        if (mediaFile && mediaFile.mimeType === 'application/json' && !animations[mediaFile.url]) {
          try {
            const response = await fetch(mediaFile.url);
            const data = await response.json();
            newAnimations[mediaFile.url] = data;
          } catch (error) {
            console.error(`Ошибка загрузки анимации для ${mediaFile.url}:`, error);
          }
        }
      }
      setAnimations(prev => ({ ...prev, ...newAnimations }));
    };
    loadAnimations();
  }, [admin.prizes]);

  const currentRaffle = admin.currentRaffle;
  const hasActiveRaffle = currentRaffle && !("message" in currentRaffle);

  // Назначить приз для текущего розыгрыша
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

  // Создание / редактирование приза
  const handleOpenCreatePrize = () => {
    setEditPrizeId(null);
    setPrizeName("");
    setPrizeValue(0);
    setPrizeDescription("");
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleEditPrize = (prize: RafflePrize) => {
    setEditPrizeId(prize.id);
    setPrizeName(prize.name);
    setPrizeValue(prize.value);
    setPrizeDescription(prize.description || "");
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Максимальный размер файла: 25MB");
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/json'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Разрешены только изображения и JSON-файлы");
        return;
      }
      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  const handleSavePrize = async () => {
    try {
      setIsSavingPrize(true);
      if (!prizeName.trim()) {
        toast.error("Введите название приза");
        return;
      }
      if (!prizeValue) {
        toast.error("Введите стоимость приза (value)");
        return;
      }

      const formData = new FormData();
      formData.append("name", prizeName);
      formData.append("value", prizeValue.toString());
      formData.append("description", prizeDescription);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editPrizeId) {
        await admin.updatePrize(editPrizeId, formData);
        toast.success("Приз успешно обновлён");
      } else {
        await admin.createPrize(formData);
        toast.success("Приз успешно создан");
      }

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

  // Настройки розыгрыша
  const handleOpenSettings = () => {
    if (currentRaffle && !("message" in currentRaffle)) {
      setTicketThreshold(currentRaffle.raffle.ticketThreshold || 50);
      setRaffleDuration((currentRaffle.raffle.raffleDuration || 4 * 60 * 60 * 1000) / (60 * 1000));
    }
    setSettingsDialogOpen(true);
  };

  const handleSaveSettings = async () => {
    try {
      setIsUpdatingSettings(true);
      if (ticketThreshold <= 0) {
        toast.error("Пороговое значение билетов должно быть положительным");
        return;
      }
      if (raffleDuration <= 0) {
        toast.error("Продолжительность розыгрыша должна быть положительной");
        return;
      }
      
      await admin.updateRaffleSettings({
        ticketThreshold,
        raffleDuration
      });
      
      toast.success("Настройки розыгрыша обновлены");
      setSettingsDialogOpen(false);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при обновлении настроек розыгрыша:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при обновлении настроек розыгрыша");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Отображение медиа приза
  const renderPrizeMedia = (prize: RafflePrize) => {
    const mediaFile = prize.media_file;
    if (mediaFile) {
      const { url, mimeType } = mediaFile;
      if (mimeType === 'application/json' && animations[url]) {
        return (
          <Lottie
            animationData={animations[url]}
            loop={true}
            autoplay={true}
            style={{ width: 40, height: 40 }}
          />
        );
      } else if (mimeType.startsWith('image/')) {
        return <img src={url} alt={prize.name} className="h-10" />;
      }
    } else if (prize.imageUrl) {
      return <img src={prize.imageUrl} alt={prize.name} className="h-10" />;
    }
    return "Нет";
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
            <p>Минимум билетов для таймера: {currentRaffle.raffle.ticketThreshold || 50}</p>
            <p>Продолжительность: {((currentRaffle.raffle.raffleDuration || 4 * 60 * 60 * 1000) / (60 * 1000))} минут</p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" onClick={handleOpenSettings}>
                Изменить настройки
              </Button>
            </div>
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
                  <TableCell>{renderPrizeMedia(prize)}</TableCell>
                  <TableCell className="text-right">
                    {hasActiveRaffle && (
                      <Button
                        variant="outline"
                        onClick={() => handleSetPrize(prize.id)}
                        disabled={isAssigningThisPrize}
                      >
                        {isAssigningThisPrize ? "Назначаем..." : "Назначить"}
                      </Button>
                    )}
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
              Заполните поля и при необходимости загрузите новый файл изображения или анимации (до 25MB)
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
              <Label>Изображение или анимация (до 25 MB)</Label>
              <Input type="file" accept="image/*,application/json" onChange={handleFileChange} />
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

      {/* Диалог настроек розыгрыша */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки розыгрыша</DialogTitle>
            <DialogDescription>
              Укажите минимальное количество билетов для активации таймера и продолжительность розыгрыша.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ticketThreshold" className="text-right">
                Минимум билетов
              </Label>
              <Input
                id="ticketThreshold"
                type="number"
                min="1"
                value={ticketThreshold}
                onChange={(e) => setTicketThreshold(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="raffleDuration" className="text-right">
                Время (мин)
              </Label>
              <Input
                id="raffleDuration"
                type="number"
                min="1"
                value={raffleDuration}
                onChange={(e) => setRaffleDuration(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveSettings} disabled={isUpdatingSettings}>
              {isUpdatingSettings ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default RafflePage;