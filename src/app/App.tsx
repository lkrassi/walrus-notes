import { appRoutesConfig } from 'app/router/config';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { NotificationsContainer, store } from 'widgets';

export const App = () => {
  return (
    <Provider store={store}>
      <div className='bg-gradient'>
        <Routes>
          {appRoutesConfig.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
        <NotificationsContainer />
      </div>
    </Provider>
  );
};
