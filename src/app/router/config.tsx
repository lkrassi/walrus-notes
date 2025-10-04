import { MainPage } from 'pages';
import { AuthPage } from 'pages';
import { DashBoardPage } from 'pages';
import { NotFoundPage } from 'pages';

export const AppRoutes = {
  MAIN: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

export const appRoutesConfig = [
  { path: AppRoutes.MAIN, element: <MainPage /> },
  { path: AppRoutes.AUTH, element: <AuthPage /> },
  { path: AppRoutes.DASHBOARD, element: <DashBoardPage /> },
  { path: '*', element: <NotFoundPage /> },
];
