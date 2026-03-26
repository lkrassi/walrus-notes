import { AuthSyncProvider } from '@/app/providers/AuthSyncProvider';
import { ModalProvider } from '@/app/providers/modal';
import { NotificationsContainer } from '@/app/providers/notifications';
import { ShareModalProvider } from '@/app/providers/share/ShareModalProvider';
import { appRoutesConfig } from '@/app/router/config';
import { store } from '@/app/store';
import { cn } from '@/shared/lib/core';
import { SidebarProvider } from '@/widgets/hooks';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

export const App = () => {
  return (
    <>
      <div
        className={cn(
          'bg-bg text-text dark:bg-dark-bg dark:text-dark-text',
          'min-h-screen',
          'relative'
        )}
      >
        <Provider store={store}>
          <AuthSyncProvider>
            <SidebarProvider>
              <ModalProvider>
                <ShareModalProvider>
                  <Routes>
                    {appRoutesConfig.map(route => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                  </Routes>
                </ShareModalProvider>
                <NotificationsContainer />
              </ModalProvider>
            </SidebarProvider>
          </AuthSyncProvider>
        </Provider>
      </div>
    </>
  );
};
