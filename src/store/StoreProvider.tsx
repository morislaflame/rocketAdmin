import React, { createContext, useState, useEffect, ReactNode } from "react";
import LoadingIndicator from "../components/ui/LoadingIndicator";
import UserStore from "../store/UserStore";

// Определяем интерфейс для нашего контекста
export interface IStoreContext {
  user: UserStore;
}

// Создаем контекст с начальным значением null, но указываем правильный тип
export const Context = createContext<IStoreContext | null>(null);

// Добавляем типы для пропсов
interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  const [stores, setStores] = useState<{
    user: UserStore;
  } | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const [
        { default: UserStore },
      ] = await Promise.all([
        import("../store/UserStore"),
      ]);

      setStores({
        user: new UserStore(),
      });
    };

    loadStores();
  }, []);

  if (!stores) {
    return <LoadingIndicator />; // Use custom loading indicator
  }

  return <Context.Provider value={stores}>{children}</Context.Provider>;
};

export default StoreProvider;
