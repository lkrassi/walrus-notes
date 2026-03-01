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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;

          const parts = id.split('node_modules/');
          if (parts.length < 2) return undefined;
          let pkgPath = parts[1];

          if (pkgPath.startsWith('.pnpm')) {
            const afterPnpm = pkgPath.replace(/^\.pnpm\//, '');
            const nmIndex = afterPnpm.indexOf('/node_modules/');
            if (nmIndex !== -1) {
              pkgPath = afterPnpm.slice(nmIndex + '/node_modules/'.length);
            } else {
              const seg = afterPnpm.split('/')[0];
              const lastAt = seg.lastIndexOf('@');
              pkgPath = lastAt > 0 ? seg.slice(0, lastAt) : seg;
            }
          }

          const pkgName = pkgPath.startsWith('@')
            ? pkgPath.split('/').slice(0, 2).join('/')
            : pkgPath.split('/')[0];

          if (pkgName === 'react' || pkgName === 'react-dom')
            return 'vendor.react';
          if (pkgName.startsWith('@mui') || pkgName.startsWith('@emotion'))
            return 'vendor.mui';

          if (pkgName === 'yjs') return 'vendor.yjs';
          if (pkgName === 'y-websocket' || pkgName.startsWith('y-'))
            return 'vendor.yjs.websocket';

          if (pkgName.startsWith('reactflow')) return 'vendor.reactflow';

          if (pkgName === 'refractor') {
            if (
              id.includes('/lang') ||
              id.includes('/languages') ||
              id.includes('lang-')
            ) {
              const pathParts = id.split(/[/\\\\]/);
              const fileName = pathParts[pathParts.length - 1] || 'langs';
              const lang = fileName.split('.')[0].replace(/[^a-z0-9_-]/gi, '');
              return `vendor.refractor.lang.${lang}`;
            }
            return 'vendor.refractor.core';
          }

          if (
            [
              'highlight.js',
              'react-syntax-highlighter',
              'html2pdf.js',
            ].includes(pkgName)
          )
            return `vendor.${pkgName.replace('/', '_')}`;

          return `vendor.${pkgName.replace('/', '_')}`;
        },
      },
    },
  },
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
