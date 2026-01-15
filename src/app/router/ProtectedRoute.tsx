import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'widgets/hooks/redux';
import { AppRoutes } from './config';

type ProtectedRouteProps = {
  children: React.ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { accessToken, refreshToken } = useAppSelector(state => state.user);
  const isAuthenticated = !!(accessToken && refreshToken);

  return isAuthenticated ? children : <Navigate to={AppRoutes.AUTH} replace />;
};
