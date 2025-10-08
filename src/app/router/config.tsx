import { AuthPage, DashBoardPage, MainPage, NotFoundPage } from 'pages';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = {
  MAIN: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '*',
};

export const appRoutesConfig = [
  {
    path: AppRoutes.MAIN,
    element: <MainPage />,
  },
  {
    path: AppRoutes.AUTH,
    element: (
      <GuestRoute>
        <AuthPage />
      </GuestRoute>
    ),
  },
  {
    path: AppRoutes.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashBoardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.NOT_FOUND,
    element: <NotFoundPage />,
  },
];
