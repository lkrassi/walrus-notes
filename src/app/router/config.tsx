import { ApplyLinkHandler } from 'features/share/ui/ApplyLinkHandler';
import { lazy, Suspense } from 'react';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import {
  AuthPageSkeleton,
  DashboardPageSkeleton,
  MainPageSkeleton,
  NotFoundPageSkeleton,
  SettingsPageSkeleton,
} from './RouteSkeletons';

const MainPage = lazy(() =>
  import('pages/main/ui/MainPage').then(m => ({ default: m.MainPage }))
);
const AuthPage = lazy(() =>
  import('pages/auth/ui/AuthPage').then(m => ({ default: m.AuthPage }))
);
const DashBoardPage = lazy(() =>
  import('pages/dashboard/DashBoardPage').then(m => ({
    default: m.DashBoardPage,
  }))
);
const ProfilePage = lazy(() =>
  import('pages/profile/ui/ProfilePage').then(m => ({ default: m.ProfilePage }))
);
const NotFoundPage = lazy(() =>
  import('pages/not-found/ui/NotFoundPage').then(m => ({
    default: m.NotFoundPage,
  }))
);

export const AppRoutes = {
  MAIN: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard/:layoutId?/:noteId?',
  PROFILE: '/profile',
  APPLY: '/apply',
  NOT_FOUND: '*',
};

export const appRoutesConfig = [
  {
    path: AppRoutes.MAIN,
    element: (
      <Suspense fallback={<MainPageSkeleton />}>
        <MainPage />
      </Suspense>
    ),
  },
  {
    path: AppRoutes.AUTH,
    element: (
      <GuestRoute>
        <Suspense fallback={<AuthPageSkeleton />}>
          <AuthPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: AppRoutes.APPLY,
    element: (
      <Suspense fallback={null}>
        <ApplyLinkHandler />
      </Suspense>
    ),
  },
  {
    path: AppRoutes.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<DashboardPageSkeleton />}>
          <DashBoardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.PROFILE,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<SettingsPageSkeleton />}>
          <ProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.NOT_FOUND,
    element: (
      <Suspense fallback={<NotFoundPageSkeleton />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];
