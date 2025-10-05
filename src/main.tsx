import { StrictMode } from 'react';

import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'widgets';

import { App } from 'app/App';
import { createRoot } from 'react-dom/client';

import './app/styles/App.css';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
