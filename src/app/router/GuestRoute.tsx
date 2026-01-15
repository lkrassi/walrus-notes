import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'widgets/hooks/redux';
import { AppRoutes } from './config';

type GuestRouteProps = {
  children: React.ReactElement;
};

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { accessToken, refreshToken } = useAppSelector(state => state.user);
  const isAuthenticated = !!(accessToken && refreshToken);

  return !isAuthenticated ? (
    children
  ) : (
    <Navigate to={AppRoutes.DASHBOARD} replace />
  );
};
