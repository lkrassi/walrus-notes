export const AppRoutes = {
  FIRST: '/',
  AUTH: '/auth',
  MAIN: '/main/:layoutId?/:noteId?',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  UNAVAILABLE: '*',
} as const;
