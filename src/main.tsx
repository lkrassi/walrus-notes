import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'widgets';

import { createRoot } from 'react-dom/client';
import { App } from './App';

import './app/styles/App.css';
import './app/styles/markdown.css';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
