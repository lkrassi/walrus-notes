import { Navigate } from 'react-router-dom';
import { checkAuth } from 'shared/api/checkAuth';
import { AppRoutes } from './config';

type ProtectedRouteProps = {
  children: React.ReactElement;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = checkAuth();

  return isAuthenticated ? children : <Navigate to={AppRoutes.AUTH} replace />;
};
