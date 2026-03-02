import { lazy, Suspense } from 'react';
import { Loader } from 'shared/ui/components/Loader';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

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
const ApplyLinkPage = lazy(() =>
  import('pages/apply/ui/ApplyLinkPage').then(m => ({
    default: m.ApplyLinkPage,
  }))
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
      <Suspense fallback={<Loader />}>
        <MainPage />
      </Suspense>
    ),
  },
  {
    path: AppRoutes.AUTH,
    element: (
      <GuestRoute>
        <Suspense fallback={<Loader />}>
          <AuthPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: AppRoutes.APPLY,
    element: (
      <Suspense fallback={<Loader />}>
        <ApplyLinkPage />
      </Suspense>
    ),
  },
  {
    path: AppRoutes.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader />}>
          <DashBoardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.PROFILE,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader />}>
          <ProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.NOT_FOUND,
    element: (
      <Suspense fallback={<Loader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];
