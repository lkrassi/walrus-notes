import { Loader } from '@/shared/ui';
import { lazy, Suspense } from 'react';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AppRoutes } from './routes';

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
const CookiesPage = lazy(() =>
  import('pages/cookies/ui/CookiesPage').then(m => ({
    default: m.CookiesPage,
  }))
);

const PublicPageLoader = () => (
  <div className='flex min-h-[80vh] items-center justify-center px-4 py-10'>
    <Loader />
  </div>
);

const AppPageLoader = () => (
  <div className='flex min-h-screen items-center justify-center px-4 py-10'>
    <Loader />
  </div>
);

export const appRoutesConfig = [
  {
    path: AppRoutes.FIRST,
    element: (
      <Suspense fallback={<PublicPageLoader />}>
        <FirstPage />
      </Suspense>
    ),
  },
  {
    path: AppRoutes.AUTH,
    element: (
      <GuestRoute>
        <Suspense fallback={<PublicPageLoader />}>
          <AuthPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: AppRoutes.CONSENT,
    element: (
      <Suspense fallback={<PublicPageLoader />}>
        <CookiesPage />
      </Suspense>
    ),
  },
  {
    path: AppRoutes.MAIN,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<AppPageLoader />}>
          <MainPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<AppPageLoader />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.PROFILE,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<AppPageLoader />}>
          <ProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: AppRoutes.UNAVAILABLE,
    element: (
      <Suspense fallback={<PublicPageLoader />}>
        <UnavailablePage />
      </Suspense>
    ),
  },
];

export { AppRoutes };
