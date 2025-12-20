import { appRoutesConfig } from 'app/router/config';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { SidebarProvider, store } from 'widgets';
import cn from 'shared/lib/cn';
import {
  ModalProvider,
  NotificationsContainer,
  SnowfallOverlay,
} from 'widgets/ui';

export const App = () => {
  return (
    <>
      <div className={cn('bg-gradient', 'min-h-screen', 'relative')}>
        <Provider store={store}>
          <SidebarProvider>
            <ModalProvider>
              <SnowfallOverlay />
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
        </Provider>
      </div>
    </>
  );
};
