import { AuthSyncProvider } from 'app/providers/AuthSyncProvider';
import { appRoutesConfig } from 'app/router/config';
import { store } from 'app/store';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { cn } from 'shared/lib/cn';

import { SidebarProvider } from 'widgets/hooks/sidebarContext';
import { ModalProvider } from 'widgets/ui/components/modal/ModalProvider';
import { NotificationsContainer } from 'widgets/ui/components/notifications/NotificationsContainer';

export const App = () => {
  return (
    <>
      <div className={cn('min-h-screen', 'relative')}>
        <Provider store={store}>
          <AuthSyncProvider>
            <SidebarProvider>
              <ModalProvider>
                <Routes>
                  {appRoutesConfig.map(route => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                </Routes>
                <NotificationsContainer />
              </ModalProvider>
            </SidebarProvider>
          </AuthSyncProvider>
        </Provider>
      </div>
    </>
  );
};
