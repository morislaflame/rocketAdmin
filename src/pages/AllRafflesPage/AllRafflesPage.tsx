"use client";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";
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
import { toast } from "sonner";
import { ServerError, Raffle } from "@/types/types";

const AllRafflesPage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadRaffles(0, true);
  }, [admin]);

  const loadRaffles = async (newOffset: number, initial = false) => {
    try {
      const data = await admin.getRaffleHistory(limit, newOffset);
      if (initial) {
        setRaffles(data);
      } else {
        setRaffles((prev) => [...prev, ...data]);
      }
      if (data.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setOffset(newOffset + data.length);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при загрузке розыгрышей:", error);
      toast.error(
        serverError?.response?.data?.message || "Ошибка при загрузке розыгрышей"
      );
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadRaffles(offset);
    setIsLoadingMore(false);
  };

  const handleRowClick = async (raffleId: number) => {
    try {
      const data = await admin.getRaffleById(raffleId);
      // Извлекаем данные розыгрыша из поля "raffle"
      setSelectedRaffle(data.raffle);
      setDialogOpen(true);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при получении информации о розыгрыше:", error);
      toast.error(
        serverError?.response?.data?.message || "Ошибка при получении информации о розыгрыше"
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Все розыгрыши</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Начало</TableHead>
            <TableHead>Окончание</TableHead>
            <TableHead>Приз</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {raffles.map((raffle) => (
            <TableRow key={raffle.id}>
              <TableCell>{raffle.id}</TableCell>
              <TableCell>{raffle.status}</TableCell>
              <TableCell>{raffle.startTime}</TableCell>
              <TableCell>{raffle.endTime || "—"}</TableCell>
              <TableCell>
                {raffle.raffle_prize ? raffle.raffle_prize.name : "Не назначен"}
              </TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => handleRowClick(raffle.id)}>
                  Посмотреть
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="mt-4">
          <Button onClick={handleLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? "Загрузка..." : "Загрузить ещё"}
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Детали розыгрыша</DialogTitle>
            <DialogDescription>Полная информация о розыгрыше</DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-2">
            {selectedRaffle ? (
              <>
                <p>
                  <strong>ID:</strong> {selectedRaffle.id}
                </p>
                <p>
                  <strong>Статус:</strong> {selectedRaffle.status}
                </p>
                <p>
                  <strong>Начало:</strong> {selectedRaffle.startTime}
                </p>
                <p>
                  <strong>Окончание:</strong>{" "}
                  {selectedRaffle.endTime ? selectedRaffle.endTime : "—"}
                </p>
                <p>
                  <strong>Приз:</strong>{" "}
                  {selectedRaffle.raffle_prize
                    ? selectedRaffle.raffle_prize.name
                    : "Не назначен"}
                </p>
                <p>
                  <strong>Всего билетов:</strong> {selectedRaffle.totalTickets}
                </p>
                <p>
                  <strong>Выигравший билет:</strong> {selectedRaffle?.winningTicketNumber || "—"}
                </p>
                <p>
                  <strong>Выигравший пользователь:</strong> {selectedRaffle?.winner?.username || "—"}
                </p>
                <p>
                  <strong>Телеграм ID выигравшего пользователя:</strong> {selectedRaffle?.winner?.telegramId || "—"}
                </p>
                
                {/* Добавьте другие поля по необходимости */}
              </>
            ) : (
              <p>Информация отсутствует</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default AllRafflesPage;
