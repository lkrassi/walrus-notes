import { appRoutesConfig } from 'app/router/config';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { SidebarProvider, store } from 'widgets';
import cn from 'shared/lib/cn';
import { ModalProvider, NotificationsContainer } from 'widgets/ui';
import Snowfall from 'widgets/ui/components/Snowfall';

export const App = () => {
  return (
    <>
      <div className={cn('bg-gradient', 'min-h-screen', 'relative')}>
        <Snowfall density={0.07} />
        <Provider store={store}>
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
        </Provider>
      </div>
    </>
  );
};
