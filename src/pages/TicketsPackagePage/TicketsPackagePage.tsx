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

// Импортируем ваш интерфейс RaffleTicketPackage и тип ошибки
import { RaffleTicketPackage, ServerError } from "@/types/types";
// Импортируем toast из sonner
import { toast } from "sonner";

const TicketsPackagePage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<RaffleTicketPackage | null>(null);

  // При первом монтировании загружаем пакеты
  useEffect(() => {
    admin.getAllPackages().catch((err) => {
      const serverError = err as ServerError;
      console.error("Ошибка при загрузке пакетов:", err);
      toast.error(serverError?.response?.data?.message || "Ошибка при загрузке пакетов");
    });
  }, [admin]);

  // "Добавить пакет"
  const handleAddClick = () => {
    setSelectedPackage(null);
    setOpenDialog(true);
  };

  // "Изменить пакет"
  const handleEditClick = (pkg: RaffleTicketPackage) => {
    setSelectedPackage(pkg);
    setOpenDialog(true);
  };

  // Меняем поля формы
  const handleChangeField = (
    field: keyof RaffleTicketPackage,
    value: string
  ) => {
    if (!selectedPackage) {
      setSelectedPackage({
        ...({} as RaffleTicketPackage),
        [field]:
          field === "ticketCount" ? Number(value) :
          field === "price" ? value : // Оставляем строкой при вводе
          value,
      });
    } else {
      setSelectedPackage({
        ...selectedPackage,
        [field]:
          field === "ticketCount" ? Number(value) :
          field === "price" ? value : // Оставляем строкой при вводе
          value,
      });
    }
  };

  // Сохранение пакета (нового или обновлённого)
  const handleSave = async () => {
    if (!selectedPackage) return;

    try {
      // Преобразуем price в число перед отправкой на сервер
      const packageData = {
        name: selectedPackage.name,
        ticketCount: selectedPackage.ticketCount,
        price: typeof selectedPackage.price === 'string' 
          ? Number(selectedPackage.price) 
          : selectedPackage.price,
      };

      if (selectedPackage.id) {
        // Редактируем
        await admin.updatePackage(selectedPackage.id, packageData);
        toast.success("Пакет успешно обновлён");
      } else {
        // Создаём
        await admin.createPackage(packageData);
        toast.success("Пакет успешно создан");
      }

      // Перезагружаем список, закрываем диалог
      await admin.getAllPackages();
      setOpenDialog(false);
      setSelectedPackage(null);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при сохранении пакета:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при сохранении пакета");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Пакеты для розыгрышей (Raffle Tickets)
      </h1>

      {/* Кнопка "Добавить" */}
      <Button onClick={handleAddClick} className="mb-4">
        Добавить пакет
      </Button>

      {/* Таблица с пакетами */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Кол-во билетов (ticketCount)</TableHead>
            <TableHead>Цена (price)</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admin.packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell>{pkg.id}</TableCell>
              <TableCell>{pkg.name}</TableCell>
              <TableCell>{pkg.ticketCount}</TableCell>
              <TableCell>{pkg.price}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" onClick={() => handleEditClick(pkg)}>
                  Изменить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Диалог для добавления / редактирования */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPackage?.id ? "Редактировать пакет" : "Добавить пакет"}
            </DialogTitle>
            <DialogDescription>
              Заполните поля ниже и нажмите «Сохранить».
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={selectedPackage?.name || ""}
                onChange={(e) => handleChangeField("name", e.target.value)}
                placeholder="Например: Стартовый пакет"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ticketCount">Кол-во билетов (ticketCount)</Label>
              <Input
                id="ticketCount"
                type="number"
                value={selectedPackage?.ticketCount ?? ""}
                onChange={(e) =>
                  handleChangeField("ticketCount", e.target.value)
                }
                placeholder="Например: 10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Цена (price)</Label>
              <Input
                id="price"
                type="text"
                value={selectedPackage?.price ?? ""}
                onChange={(e) => handleChangeField("price", e.target.value)}
                placeholder="Например: 3.5"
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

export default TicketsPackagePage;
