// router/config.tsx
import { AuthPage, DashBoardPage, MainPage, NotFoundPage } from 'pages';
import { SettingsPage } from 'pages/settings/ui/SettingsPage';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = {
  MAIN: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard/:layoutId?/:noteId?',
  SETTINGS: '/settings',
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
    path: AppRoutes.SETTINGS,
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.NOT_FOUND,
    element: <NotFoundPage />,
  },
];
