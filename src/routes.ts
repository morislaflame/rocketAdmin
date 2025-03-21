// src/routes.ts (если у вас массив роутов)
import LoginPage from './pages/LoginPage/LoginPage';
import NotAdminPage from './pages/NotAdminPage/NotAdminPage';
import AdminPage from './pages/AdminPage/AdminPage';
import { LOGIN_ROUTE, NOT_FOUND_ROUTE, ADMIN_ROUTE, RAFFLE_ROUTE, ATTEMPTS_PACKAGE_ROUTE, DAILY_REWARD_ROUTE, TASKS_ROUTE, TICKETS_PACKAGE_ROUTE, USERS_ROUTE, ALL_RAFFLES_ROUTE, REQUESTED_PRIZES_ROUTE, LEADERBOARD_ROUTE } from './utils/consts';
import { IRoute, UserInfo } from './types/types';
import AttemptsPackagePage from './pages/AttemptsPackagePage/AttemptsPackagePage';
import RafflePage from './pages/RafflePage/RafflePage';
import DailyRewardPage from './pages/DailyRewardPage/DailyRewardPage';
import TasksPage from './pages/TasksPage/TasksPage';
import TicketsPackagePage from './pages/TicketsPackagePage/TicketsPackagePage';
import UsersPage from './pages/UsersPage/UsersPage';
import AllRafflesPage from './pages/AllRafflesPage/AllRafflesPage';
import RequestedPrizesPage from './pages/RequestedPrizesPage';
import LeaderboardPage from './pages/LeaderboardPage/LeaderboardPage';

export const authRoutes = (user: UserInfo | null) => {
    console.log("User in authRoutes:", user);

    if (!user) {
        return [];
      }

    const routes: IRoute[] = [
        {
            path: NOT_FOUND_ROUTE,
            Component: NotAdminPage
        },
        {
            path: ADMIN_ROUTE,
            Component: AdminPage
        },
    ];
    
    if (user && user.role === 'ADMIN') {
        console.log("User is admin, adding admin route");
        routes.push({
            path: TASKS_ROUTE,
            Component: TasksPage
        });
        routes.push({
            path: DAILY_REWARD_ROUTE,
            Component: DailyRewardPage
        });
        routes.push({
            path: ATTEMPTS_PACKAGE_ROUTE,
            Component: AttemptsPackagePage
        });
        routes.push({
            path: RAFFLE_ROUTE,
            Component: RafflePage
        });
        routes.push({
            path: TICKETS_PACKAGE_ROUTE,
            Component: TicketsPackagePage
        });
        routes.push({
            path: USERS_ROUTE,
            Component: UsersPage
        });
        routes.push({
            path: ALL_RAFFLES_ROUTE,
            Component: AllRafflesPage
        });
        routes.push({
            path: REQUESTED_PRIZES_ROUTE,
            Component: RequestedPrizesPage
        });
        routes.push({
            path: LEADERBOARD_ROUTE,
            Component: LeaderboardPage
        });
    } else {
        console.log("User is not admin");
    }

    return routes;
};


export const publicRoutes: IRoute[] = [
    
    {
        path: LOGIN_ROUTE,
        Component: LoginPage 
    },
    
];