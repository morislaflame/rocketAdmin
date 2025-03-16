"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";
import { ServerError, UserInfo } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy } from "lucide-react";


const UsersPage: React.FC = observer(() => {
  const { admin } = React.useContext(Context) as IStoreContext;
  const [userId, setUserId] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [username, setUsername] = useState("");
  const [foundUser, setFoundUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReferralsOpen, setIsReferralsOpen] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  };

  const calculateTotalReferralsSpent = () => {
    if (!foundUser?.Referrals) return 0;
    return foundUser.Referrals.reduce((sum, referral) => 
      sum + parseFloat(referral.ReferralUser.totalSpent || "0"), 0);
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
          <p>
            <strong>Количество рефералов:</strong>{" "}
            <Button 
              variant="secondary" 
              className=" h-auto" 
              onClick={() => setIsReferralsOpen(true)}
            >
              {foundUser.referralsCount || 0}
            </Button>
          </p>
          <p>
            <strong>Общий расход TON рефералами:</strong>{" "}
            {calculateTotalReferralsSpent().toFixed(9)}
          </p>
        </div>
      )}

      <Dialog open={isReferralsOpen && !!foundUser} onOpenChange={setIsReferralsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Список рефералов</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {foundUser?.Referrals && foundUser.Referrals.length > 0 ? (
              <div className="grid gap-2">
                {foundUser.Referrals.map((referral) => (
                  <div key={referral.id} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1">
                        <p><strong>ID:</strong> {referral.ReferralUser.id}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(referral.ReferralUser.id.toString())}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <p><strong>Потрачено TON:</strong> {parseFloat(referral.ReferralUser.totalSpent || "0").toFixed(9)}</p>
                      <p><strong>Зарегистрирован:</strong> {new Date(referral.registeredAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Нет рефералов</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default UsersPage;
