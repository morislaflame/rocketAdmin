import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { toast } from "sonner";
import { Context, IStoreContext } from "@/store/StoreProvider";
import { UserPrize } from "@/types/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const RequestedPrizesPage: React.FC = observer(() => {
  const { admin } = React.useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    loadRequestedPrizes();
  }, []);

  const loadRequestedPrizes = async () => {
    setLoading(true);
    try {
      await admin.getRequestedPrizes();
    } catch (error) {
      toast.error("Ошибка при загрузке призов");
      console.error("Ошибка при загрузке призов:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (prizeId: number) => {
    setConfirmingId(prizeId);
    try {
      await admin.confirmPrizeDelivery(prizeId);
      toast.success("Доставка приза подтверждена");
    } catch (error) {
      toast.error("Ошибка при подтверждении доставки");
      console.error("Ошибка при подтверждении доставки:", error);
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (admin.requestedPrizes.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Запрошенные призы</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Нет запрошенных призов для выдачи
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Запрошенные призы</h1>
        <Button onClick={loadRequestedPrizes} variant="outline">
          Обновить
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {admin.requestedPrizes.map((prize: UserPrize) => (
          <Card key={prize.id}>
            <CardHeader>
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <CardTitle>{prize.raffle.raffle_prize.name}</CardTitle>
                  <img src={prize.raffle.raffle_prize.imageUrl} alt={prize.raffle.raffle_prize.name} className="w-16 h-16" />
                  <CardDescription>
                    Ценность: {prize.raffle.raffle_prize.value} токенов
                  </CardDescription>
                </div>
                <Badge variant="outline">ID: {prize.id}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Пользователь:</span>
                  <span>
                    {prize.user.username || prize.user.id}{" "}
                    {prize.user.telegramId && (
                      <a
                        href={`https://t.me/${prize.user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Telegram
                      </a>
                    )}
                  </span>

                  <span className="font-medium">Email:</span>
                  <span>{prize.user.email || "—"}</span>

                  <span className="font-medium">Telegram ID:</span>
                  <span>{prize.user.telegramId || "—"}</span>

                  <span className="font-medium">Дата запроса:</span>
                  <span>
                    {new Date(prize.updatedAt).toLocaleDateString()}
                  </span>

                  <span className="font-medium">Дата выигрыша:</span>
                  <span>
                    {new Date(prize.winDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleConfirmDelivery(prize.id)}
                disabled={confirmingId === prize.id}
              >
                {confirmingId === prize.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Подтверждение...
                  </>
                ) : (
                  "Подтвердить выдачу"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default RequestedPrizesPage;