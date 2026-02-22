import { AuthSyncProvider } from 'app/providers/AuthSyncProvider';
import { appRoutesConfig } from 'app/router/config';
import { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { cn } from 'shared/lib/cn';
import { SidebarProvider, store } from 'widgets';
import { ModalProvider } from 'widgets/ui';

const NotificationsContainer = lazy(() =>
  import('widgets/ui/components/notifications/NotificationsContainer').then(
    m => ({ default: m.NotificationsContainer })
  )
);

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
                <Suspense fallback={null}>
                  <NotificationsContainer />
                </Suspense>
              </ModalProvider>
            </SidebarProvider>
          </AuthSyncProvider>
        </Provider>
      </div>
    </>
  );
};
