import { ThemeProvider } from '@/app/providers/theme';
import { BrowserRouter } from 'react-router-dom';

import { createRoot } from 'react-dom/client';
import { App } from './App';

import '@/shared/config/i18n';
import './app/styles/App.css';
import './app/styles/markdown.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
