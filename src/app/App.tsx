import { appRoutesConfig } from 'app/router/config';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import {
  LoaderContainer,
  ModalProvider,
  NotificationsContainer,
  SidebarProvider,
  store,
} from 'widgets';

export const App = () => {
  return (
    <Provider store={store}>
      <SidebarProvider>
        <ModalProvider>
          <div className='bg-gradient min-h-screen'>
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
            <LoaderContainer />
          </div>
        </ModalProvider>
      </SidebarProvider>
    </Provider>
  );
};
