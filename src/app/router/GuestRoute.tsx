import { Navigate } from 'react-router-dom';
import { checkAuth } from 'shared/api/checkAuth';
import { AppRoutes } from './config';

type GuestRouteProps = {
  children: React.ReactElement;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const isAuthenticated = checkAuth();

  return !isAuthenticated ? (
    children
  ) : (
    <Navigate to={AppRoutes.DASHBOARD} replace />
  );
};
