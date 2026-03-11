# Walrus Notes

Walrus Notes - веб-приложение для работы с заметками и графовыми связями между ними.

Проект построен на React + TypeScript, использует Feature-Sliced Design, Redux Toolkit/RTK Query, Vite.

## Содержание

- [Основные возможности](#основные-возможности)
- [Технологии](#технологии)
- [Требования к окружению](#требования-к-окружению)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Скрипты](#скрипты)
- [Архитектура проекта](#архитектура-проекта)
- [Система тем и цветов](#система-тем-и-цветов)
- [Маршруты](#маршруты)
- [Сборка и запуск в production](#сборка-и-запуск-в-production)
- [Частые сценарии разработки](#частые-сценарии-разработки)
- [Проверки качества](#проверки-качества)
- [Отладка и типовые проблемы](#отладка-и-типовые-проблемы)

## Основные возможности

- Авторизация и регистрация пользователя.
- Дерево layout/notes в сайдбаре.
- Работа с заметками и markdown-контентом.
- Визуализация заметок в виде графа.
- Редактирование связей между узлами графа.
- Возможность делиться заметками.
- Одновременная работа надо 1 заметкой до 10-ти людьми.
- Раздел профиля/настроек.
- Раздел dashboard с правами доступа.
- Поддержка светлой/тёмной темы.
- Мультиязыночность русккий/english.

## Технологии

### Frontend

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4
- Redux Toolkit + RTK Query
- React Router 7
- Framer Motion
- DnD Kit
- React Flow
- i18next

### Backend

- Golang
- PostgreSQL
- Redis

**примечание** - что бы полноценно протестировать работу приложения, необходимо развернуть сервер, репозиторий с ним находится в откртом доступе по ссылке (`https://github.com/SanyaWarvar/walrus_notes`)

## Быстрый старт

1. Установите зависимости:

```bash
pnpm install
```

2. Создайте файл окружения (например, `.env`) и задайте `VITE_BASE_URL`.

3. Запустите клиент в dev-режиме:

```bash
pnpm dev
```

По умолчанию Vite стартует на `http://localhost:5173`.

## Переменные окружения

### `VITE_BASE_URL`

Используется для API и WebSocket URL на клиенте.

В коде API base формируется так:

```ts
baseUrl: `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1`
```

Рекомендуемый формат значения:

```env
VITE_BASE_URL=example.com
```

Если указать протокол, API-конкатенация может дать некорректный URL. Поэтому для стабильной работы используйте хост без `https://`.

## Скрипты

- `pnpm dev` - запуск Vite dev server.
- `pnpm preview` - превью собранного клиента.
- `pnpm build` - сборка клиента + компиляция production-сервера.
- `pnpm start` - запуск production-сервера из `dist-server`.
- `pnpm start:dev` - запуск server/index.ts в watch-режиме.
- `pnpm lint` - линтинг кода.
- `pnpm lint:fix` - автоисправление линта.
- `pnpm type-check` - проверка типов TypeScript.
- `pnpm format` / `pnpm format:check` - форматирование/проверка Prettier.
- `pnpm lint:styles` - stylelint для CSS.
- `pnpm check:raw-colors` - проверка запрета raw-цветов в guarded-зонах.
- `pnpm guardrails` - stylelint + check:raw-colors.

## Архитектура проекта

Проект следует Feature-Sliced Design. Базовые слои:

- `app` - инициализация приложения, провайдеры, роутинг, store.
- `pages` - страницы и их композиция.
- `widgets` - крупные составные UI-блоки.
- `features` - пользовательские сценарии.
- `entities` - бизнес-сущности.
- `shared` - переиспользуемая инфраструктура и UI-примитивы.

Дополнительные правила и соглашения по FSD описаны в `fsd.md`.

## Система тем и цветов

Цвета построены на семантических CSS-переменных.

- Light-токены: `src/styles/tokens.css` (`:root`).
- Dark-токены: `src/styles/theme.css` (`.dark`).
- Экспорт в Tailwind utility tokens: `src/styles/base.css` (`@theme`).

Ключевые моменты:

- Тема переключается через класс `dark` на `document.documentElement`.
- Управление темой находится в `src/app/providers/theme/ThemeProvider.tsx`.
- Порядок подключения стилей в `src/main.tsx` важен:
  1.  `base.css`
  2.  `tokens.css`
  3.  `theme.css`

Именно такой порядок гарантирует, что dark-переопределения не будут затёрты light-токенами.

## Маршруты

Основные маршруты определены в `src/app/router/config.tsx`:

- `/` - публичная первая страница.
- `/auth` - авторизация/регистрация (guest route).
- `/main/:layoutId?/:noteId?` - основная рабочая область (protected route).
- `/dashboard` - раздел прав доступа (protected route).
- `/profile` - профиль/настройки (protected route).
- `*` - fallback страница недоступности.

## Частые сценарии разработки

### Добавить новый UI-компонент

- Если это что-то бизнес независимое - размещайте в `src/shared/ui/components`.
- Экспортируйте через `src/shared/ui/index.ts`.

### Добавить новый feature-сценарий

- Создайте слайс в `src/features/<feature-name>`.
- Разделите код по сегментам `ui`, `model`, `lib`, `api`.
- Экспортируйте публичное API через `index.ts` с явными экспортами.

### Добавить новый API endpoint

- Для базового API используйте `apiSlice` в `src/shared/api/apiSlice.ts`.
- Вставляйте endpoint через `apiSlice.injectEndpoints(...)`.

### Добавить новый theme token

1. Добавьте переменную в `tokens.css` (light).
2. Добавьте соответствующее переопределение в `theme.css` (dark).
3. Пробросьте token в `base.css` через `--color-*` при необходимости utility-класса.

## Проверки качества

Рекомендуемый минимальный набор перед merge:

```bash
pnpm lint
pnpm type-check
pnpm guardrails
pnpm build
```

Почему это важно:

- `guardrails` защищает проект от случайных raw-цветов в критичных зонах.
- `build` гарантирует, что lazy-роуты, импорты и типы совместимы с production-сборкой.
