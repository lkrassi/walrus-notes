import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'widgets';

import { App } from './App';
import { createRoot } from 'react-dom/client';

import { StrictMode } from 'react';
import './app/styles/App.css';
import './app/styles/markdown.css';
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