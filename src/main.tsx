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

try {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('wn.note.split');
    } catch (_e) {}
    try {
      localStorage.removeItem('wn.sidebar.width');
    } catch (_e) {}
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k && k.startsWith('wn:noteDraft:')) {
          try {
            localStorage.removeItem(k);
          } catch (_e) {}
        }
      }
    } catch (_e) {}
  }
} catch (_e) {}
