export const AppRoutes = {
  FIRST: '/',
  AUTH: '/auth',
  CONSENT: '/consent',
  MAIN: '/main/:layoutId?/:noteId?',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  UNAVAILABLE: '*',
} as const;
