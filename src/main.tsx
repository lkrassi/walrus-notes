import { ThemeProvider } from '@/app/providers/theme';
import { BrowserRouter } from 'react-router-dom';

import { createRoot } from 'react-dom/client';
import { App } from './App';

import '@/shared/config';
import '@/styles/base.css';
import '@/styles/theme.css';
import '@/styles/tokens.css';

const waitForPrimaryFont = async () => {
  const timeoutMs = 2500;

  try {
    await Promise.race([
      document.fonts.load("1em 'Podkova'"),
      new Promise(resolve => setTimeout(resolve, timeoutMs)),
    ]);
  } catch (_error) {}
};

const bootstrap = async () => {
  await waitForPrimaryFont();

  const rootElement = document.documentElement;
  rootElement.classList.remove('fonts-loading');
  rootElement.classList.add('fonts-ready');

  createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
};

void bootstrap();
