import { useContext, useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "./store/StoreProvider";
import "./App.css";
import LoadingIndicator from "./components/ui/LoadingIndicator";
import Navigation from "./components/MainComponents/Navigation";
import { Toaster } from "@/components/ui/sonner"




// Lazy-loaded Components

const AppRouter = lazy(() => import("./AppRouter"));


const App = observer(() => {
  const { user } = useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      try {
        // Выполняем проверку состояния аутентификации
        await user.checkAuth();
      } catch (error) {
        console.error("Check authentication error:", error);
      }

      setLoading(false);
    };

    authenticate();
  }, [user]);

  if (loading) {
    return (
      <div className="loading">
        <LoadingIndicator />
      </div>
    );
  }

  if (user.isTooManyRequests) {
    return (
      <div className="loading">
        <h1>Too Many Requests</h1>
        <p>Please try again later</p>
      </div>
    );
  }

  return (
      <BrowserRouter>
      <Navigation />
      <Suspense
        fallback={
          <LoadingIndicator />
        }
      >
        <AppRouter />
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
});

export default App;
