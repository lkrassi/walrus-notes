# 🔍 Аудит: Перегруженные компоненты для рефакторинга

## 🚨 Критические проблемы (800+ строк)

### 1. **NotesGraphContent.tsx** (795 строк) ⭐ ПРИОРИТЕТ 1

**Проблема:** Огромный компонент управления графом заметок
**Текущая логика:**

- Инициализация графа (nodes/edges)
- Обработка drag-and-drop
- Управление связями (создание/удаление)
- Обработка box select
- История команд (undo/redo)
- Синхронизация с API
- Обработка 15+ event handlers

**Рекомендуемое разделение:**

```
NotesGraphContent.tsx
├── useGraphInitialization.ts (инициализация nodes/edges)
├── useGraphDragHandlers.ts (drag start/stop/move)
├── useGraphConnectionHandlers.ts (создание/удаление связей)
├── useGraphSelectionHandlers.ts (click, box select, hover)
├── useGraphSyncHandlers.ts (sync с API)
└── NotesGraphViewWrapper.tsx (обёртка с props-forwarding)
```

---

### 2. **Sidebar.tsx** (264 строк) ⭐ ПРИОРИТЕТ 2

**Проблема:** Много несвязанной логики в одном компоненте
**Текущая логика:**

- Mobile/desktop toggling
- Resizable sidebar ширина
- File tree integration
- Holiday settings
- Theme toggle
- Create layout/note modals
- Import/export данных

**Рекомендуемое разделение:**

```
Sidebar.tsx
├── SidebarHeader.tsx (logo, mobile menu, theme toggle)
├── SidebarContent.tsx (file tree)
├── SidebarFooter.tsx (user actions, settings)
├── useSidebarResize.ts (уже есть, но вынести шире)
└── SidebarActions.tsx (create/import/export logic)
```

---

### 3. **FileTreeItemHeader.tsx** (389 строк) ⭐ ПРИОРИТЕТ 3

**Проблема:** Обработка всех действий для элемента дерева
**Текущая логика:**

- Context menu с 10+ опциями
- Rename логика
- Delete логика
- Duplicate логика
- Share логика
- Color picker
- Move операции

**Рекомендуемое разделение:**

```
FileTreeItemHeader.tsx (140 строк)
├── FileTreeItemContextMenu.tsx (menu, actions)
├── FileTreeRenameForm.tsx (rename logic)
├── FileTreeColorPicker.tsx (color selection)
├── useFileTreeActions.ts (delete, move, duplicate)
└── useFileTreeModals.ts (modals integration)
```

---

### 4. **NotesGraphView.tsx** (316 строк) ⭐ ПРИОРИТЕТ 2

**Проблема:** Отрисовка графа с множеством interactions
**Текущая логика:**

- ReactFlow configuration
- Custom node/edge rendering
- Controls panel
- Background elements
- Mini map
- Event delegation к parent

**Рекомендуемое разделение:**

```
NotesGraphView.tsx (основная обёртка)
├── GraphControls.tsx (zoom, fit, delete button)
├── GraphBackground.tsx (background styling)
├── useGraphNodeRenderer.ts (custom node logic)
└── useGraphEdgeRenderer.ts (custom edge logic)
```

---

## ⚠️ Средние проблемы (300-380 строк)

### 5. **DashboardContent.tsx** (297 строк)

**Проблема:** Управление табами + content rendering
**Рекомендуемое разделение:**

```
DashboardContent.tsx
├── TabsBar.tsx (tabs management)
├── DashboardContentRenderer.tsx (content rendering)
└── useDashboardTabs.ts (tab logic)
```

### 6. **Settings.tsx** (246 строк)

**Проблема:** Много разных секций в одном компоненте
**Рекомендуемое разделение:**

```
Settings.tsx (основной компонент)
├── SettingsProfileCard.tsx (профиль, аватар)
├── SettingsSectionsList.tsx (список секций)
├── SettingsSectionItem.tsx (отдельная секция)
└── useSettingsProfile.ts (profile logic)
```

### 7. **Login.tsx** (315 строк)

**Проблема:** Форма логина с модалями и множество handler'ов
**Рекомендуемое разделение:**

```
Login.tsx (основная форма)
├── LoginForm.tsx (форма и валидация)
├── ForgotPasswordFlow.tsx (forgot password logic)
├── ResetPasswordFlow.tsx (reset password logic)
└── useLoginForm.ts (form logic)
```

### 8. **Register.tsx** (324 строк)

**Проблема:** Аналогично Login.tsx
**Рекомендуемое разделение:**

```
Register.tsx (основная форма)
├── RegisterForm.tsx (форма и валидация)
├── TermsCheckbox.tsx (terms acceptance)
└── useRegisterForm.ts (form logic)
```

### 9. **FileTree.tsx** (291 строк)

**Проблема:** Рендер дерева + управление экспансией + контекст меню
**Рекомендуемое разделение:**

```
FileTree.tsx (основной компонент)
├── FileTreeNode.tsx (элемент дерева)
├── FileTreeNodeList.tsx (список элементов)
└── useFileTreeRender.ts (render logic)
```

### 10. **NoteHeader.tsx** (269 строк)

**Проблема:** Множество действий заметки (export, markdown help, actions)
**Рекомендуемое разделение:**

```
NoteHeader.tsx (основной header)
├── NoteActions.tsx (кнопки действий)
├── NoteInfo.tsx (информация о заметке)
└── NoteMarkdownHelp.tsx (markdown helper modal)
```

### 11. **LinkedNotesList.tsx** (289 строк)

**Проблема:** Динамический список с фильтрацией и actions
**Рекомендуемое разделение:**

```
LinkedNotesList.tsx (основной компонент)
├── LinkedNotesFilter.tsx (фильтрация)
├── LinkedNotesItem.tsx (элемент списка)
├── useLinkedNotesData.ts (data fetching)
└── useLinkedNotesFiltering.ts (filter logic)
```

### 12. **ResetPasswordModal.tsx** (329 строк)

**Проблема:** Модаль с формой и multiple states
**Рекомендуемое разделение:**

```
ResetPasswordModal.tsx (обёртка)
├── ResetPasswordForm.tsx (основная форма)
├── ResetPasswordSuccess.tsx (success state)
└── useResetPassword.ts (logic)
```

---

## 📊 Статистика проблем

| Компонент              | Строк | Проблема                   | Приоритет |
| ---------------------- | ----- | -------------------------- | --------- |
| NotesGraphContent.tsx  | 795   | Множество хуков + handlers | 🔴 1      |
| Sidebar.tsx            | 264   | Микс из разных фич         | 🔴 2      |
| FileTreeItemHeader.tsx | 389   | Menu + Actions + Forms     | 🟠 2      |
| NotesGraphView.tsx     | 316   | Конфигурация + Rendering   | 🟠 2      |
| DashboardContent.tsx   | 297   | Tab управление             | 🟠 3      |
| NoteHeader.tsx         | 269   | Actions + Modals           | 🟠 3      |
| LinkedNotesList.tsx    | 289   | Filter + List + Fetch      | 🟠 3      |
| ResetPasswordModal.tsx | 329   | Form + States              | 🟠 3      |
| Register.tsx           | 324   | Form + Validation          | 🟠 3      |
| Login.tsx              | 315   | Form + Modals              | 🟠 3      |
| FileTree.tsx           | 291   | Render + Expand + Menu     | 🟠 3      |
| Settings.tsx           | 246   | Много секций               | 🟡 4      |

---

## ✨ Примеры рефакторинга

### Пример 1: NotesGraphContent → useGraphHandlers

```typescript
// До: 50+ строк в компоненте
const handleNodeDragStart = (event, node) => { ... }
const handleNodeDragStop = (event, node) => { ... }
const handleConnect = (connection) => { ... }

// После: отдельный хук
export const useGraphDragHandlers = (graphHistory) => {
  const handleNodeDragStart = useCallback((event, node) => {...}, []);
  const handleNodeDragStop = useCallback((event, node) => {...}, []);
  return { handleNodeDragStart, handleNodeDragStop };
};
```

### Пример 2: Sidebar → SidebarHeader + SidebarContent

```typescript
// До: 264 строк в одном файле
<Sidebar>
  <Logo />
  <MobileMenu />
  <FileTree />
  <ThemeToggle />
  <ExportButton />
</Sidebar>

// После: композиция
<Sidebar>
  <SidebarHeader />
  <SidebarContent />
  <SidebarFooter />
</Sidebar>
```

---

## 🎯 План действий

### Фаза 1: Критичные (Неделя 1)

- [ ] NotesGraphContent.tsx → разбить на 5 хуков
- [ ] Sidebar.tsx → 4 компонента

### Фаза 2: Важные (Неделя 2)

- [ ] FileTreeItemHeader.tsx → 4 компонента
- [ ] NotesGraphView.tsx → 3 компонента
- [ ] DashboardContent.tsx → 2 компонента

### Фаза 3: Улучшающие (Неделя 3)

- [ ] Settings.tsx → 3 компонента
- [ ] Login.tsx + Register.tsx → 2+2 компонента
- [ ] FileTree.tsx → 2 компонента

---

## 📝 Общие принципы рефакторинга

1. **Single Responsibility**: Каждый компонент = одна задача
2. **Composition over inheritance**: Комбинируй pequeñошкомпоненты
3. **Hooks for logic**: Извлекай логику в кастомные хуки
4. **Props drilling reduction**: Используй Context где нужно
5. **Component naming**: `Component.tsx` для UI, `useComponent.ts` для логики
