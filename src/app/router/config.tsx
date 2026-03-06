import { ApplyLinkHandler } from 'features/dashboard/ui/ApplyLinkHandler';
import { lazy, Suspense } from 'react';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import {
  AuthPageSkeleton,
  MainPageSkeleton,
  FirstPageSkeleton,
  NotFoundPageSkeleton,
  DashboardPageSkeleton,
  SettingsPageSkeleton,
} from './RouteSkeletons';

const FirstPage = lazy(() =>
  import('pages/first/ui/FirstPage').then(m => ({ default: m.FirstPage }))
);
const MainPage = lazy(() =>
  import('pages/main/ui/MainPage').then(m => ({
    default: m.MainPage,
  }))
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
  FIRST: '/',
  AUTH: '/auth',
  MAIN: '/main/:layoutId?/:noteId?',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  APPLY: '/apply',
  NOT_FOUND: '*',
};

export const appRoutesConfig = [
  {
    path: AppRoutes.FIRST,
    element: (
      <Suspense fallback={<FirstPageSkeleton />}>
        <FirstPage />
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
    path: AppRoutes.MAIN,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<MainPageSkeleton />}>
          <MainPage />
        </Suspense>
      </ProtectedRoute>
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
