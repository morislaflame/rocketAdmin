"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";
import { ServerError, UserInfo } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const UsersPage: React.FC = observer(() => {
  const { admin } = React.useContext(Context) as IStoreContext;
  const [userId, setUserId] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [username, setUsername] = useState("");
  const [foundUser, setFoundUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    // Проверяем, что ровно одно поле заполнено
    const filledFields = [userId, telegramId, username].filter((v) => v.trim() !== "");
    if (filledFields.length !== 1) {
      toast.error("Заполните ровно одно поле для поиска");
      return;
    }
    setLoading(true);
    try {
      const params: { userId?: string; telegramId?: string; username?: string } = {};
      if (userId.trim()) {
        params.userId = userId.trim();
      } else if (telegramId.trim()) {
        params.telegramId = telegramId.trim();
      } else if (username.trim()) {
        params.username = username.trim();
      }
      const user = await admin.searchUser(params);
      setFoundUser(user);
      toast.success("Пользователь найден");
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при поиске пользователя:", error);
      toast.error(
        serverError?.response?.data?.message || "Пользователь не найден"
      );
      setFoundUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Поиск пользователя</h1>
      <div className="flex flex-col gap-2">
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Введите id"
        />
        <Input
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          placeholder="Введите telegramId"
        />
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Введите username"
        />
      </div>
      <div className="mt-2">
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Поиск..." : "Поиск"}
        </Button>
      </div>
      {foundUser && (
        <div className="mt-4 p-4 border rounded flex flex-col gap-1 items-start">
          <p>
            <strong>ID:</strong> {foundUser.id}
          </p>
          <p>
            <strong>Email:</strong> {foundUser.email || "—"}
          </p>
          <p>
            <strong>Username:</strong> {foundUser.username || "—"}
          </p>
          <p>
            <strong>Telegram ID:</strong> {foundUser.telegramId}
          </p>
          <p>
            <strong>Баланс:</strong> {foundUser.balance}
          </p>
          <p>
            <strong>Билеты:</strong> {foundUser.tickets}
          </p>
          <p>
            <strong>Попытки:</strong> {foundUser.attempts}
          </p>
          <p>
            <strong>День ежедневного вознаграждения:</strong> {foundUser.dailyRewardDay}
          </p>
          <p>
            <strong>Последнее ежедневное вознаграждение:</strong> {foundUser.lastDailyRewardClaimAt}
          </p>
          <p>
            <strong>Участвовал в розыгрыше:</strong> {foundUser.participatesInRaffle ? "Да" : "Нет"}
          </p>
          <p>
            <strong>Реферальный код:</strong> {foundUser.referralCode}
          </p>
          <p>
            <strong>Id реферала:</strong> {foundUser.referrerId}
          </p>
          <p>
            <strong>Сумма потраченных тонов:</strong> {foundUser.totalSpent}
          </p>
          <p>
            <strong>Тон-адрес:</strong> {foundUser.tonAddress}
          </p>
          
        </div>
      )}
    </div>
  );
});

export default UsersPage;
