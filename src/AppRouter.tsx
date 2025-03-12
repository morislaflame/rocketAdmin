import { useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes, publicRoutes } from './routes';
import { LOGIN_ROUTE } from './utils/consts';
import { Context, IStoreContext } from './store/StoreProvider';
import { IRoute } from './types/types';

const AppRouter = () => {
    const { user } = useContext(Context) as IStoreContext;
    const [routes, setRoutes] = useState<IRoute[]>([]);

    useEffect(() => {
        setRoutes(authRoutes(user.user));
    }, [user.isAuth, user.user?.role]);

    return (
        <Routes>
            {user.isAuth && routes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}

            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}

            <Route path="*" element={<Navigate to={LOGIN_ROUTE} />} />
        </Routes>
    );
};

export default AppRouter;
