import { AuthPage, DashBoardPage, MainPage, NotFoundPage } from 'pages';

export const AppRoutes = {
  MAIN: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '*',
};

export const appRoutesConfig = [
  { path: AppRoutes.MAIN, element: <MainPage /> },
  { path: AppRoutes.AUTH, element: <AuthPage /> },
  { path: AppRoutes.DASHBOARD, element: <DashBoardPage /> },
  { path: AppRoutes.NOT_FOUND, element: <NotFoundPage /> },
];
