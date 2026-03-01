import { AuthSyncProvider } from 'app/providers/AuthSyncProvider';
import { appRoutesConfig } from 'app/router/config';
import { store } from 'app/store';
import { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { cn } from 'shared/lib/cn';
import { Loader } from 'shared/ui/components/Loader';
import { SidebarProvider } from 'widgets/hooks/sidebarContext';
import { ModalProvider } from 'widgets/ui/components/modal/ModalProvider';

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
                <Suspense
                  fallback={
                    <div className='flex min-h-screen items-center justify-center'>
                      <Loader size='lg' />
                    </div>
                  }
                >
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
