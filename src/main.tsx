import { ThemeProvider } from '@/app/providers/theme';
import { BrowserRouter } from 'react-router-dom';

import { createRoot } from 'react-dom/client';
import { App } from './App';

import '@/shared/config';
import '@/styles/base.css';
import '@/styles/tokens.css';
import '@/styles/theme.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
