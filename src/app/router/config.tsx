import { lazy, Suspense } from 'react';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import {
  AuthPageSkeleton,
  DashboardPageSkeleton,
  FirstPageSkeleton,
  MainPageSkeleton,
  SettingsPageSkeleton,
  UnavailablePageSkeleton,
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
const DashboardPage = lazy(() =>
  import('pages/dashboard/DashboardPage').then(m => ({
    default: m.DashboardPage,
  }))
);
const ProfilePage = lazy(() =>
  import('pages/profile/ui/ProfilePage').then(m => ({ default: m.ProfilePage }))
);
const UnavailablePage = lazy(() =>
  import('pages/unavailable/ui/UnavailablePage').then(m => ({
    default: m.UnavailablePage,
  }))
);

export const AppRoutes = {
  FIRST: '/',
  AUTH: '/auth',
  MAIN: '/main/:layoutId?/:noteId?',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  UNAVAILABLE: '*',
  RANDOM: '/random',
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
    path: AppRoutes.RANDOM,
    element: <MainPageSkeleton />,
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
          <DashboardPage />
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
    path: AppRoutes.UNAVAILABLE,
    element: (
      <Suspense fallback={<UnavailablePageSkeleton />}>
        <UnavailablePage />
      </Suspense>
    ),
  },
];
