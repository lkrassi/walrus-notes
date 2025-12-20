import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      app: fileURLToPath(new URL('./src/app', import.meta.url)),
      'app/*': fileURLToPath(new URL('./src/app/*', import.meta.url)),
      pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
      'pages/*': fileURLToPath(new URL('./src/pages/*', import.meta.url)),
      shared: fileURLToPath(new URL('./src/shared', import.meta.url)),
      'shared/*': fileURLToPath(new URL('./src/shared/*', import.meta.url)),
      widgets: fileURLToPath(new URL('./src/widgets', import.meta.url)),
      'widgets/*': fileURLToPath(new URL('./src/widgets/*', import.meta.url)),
      features: fileURLToPath(new URL('./src/features', import.meta.url)),
      'features/*': fileURLToPath(new URL('./src/features/*', import.meta.url)),
      public: fileURLToPath(new URL('./public', import.meta.url)),
      'public/*': fileURLToPath(new URL('./public/*', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    allowedHosts: ['walrus-notes-y15d.onrender.com', 'localhost', '127.0.0.1'],
  },
});
