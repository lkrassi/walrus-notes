# Поддержка тач-устройств для dnd-kit

## Проблема

**ReactFlow** — desktop-first библиотека, которая плохо работает на мобильных устройствах. Перетаскивание нод не работает на тач-экранах из-за отсутствия нативной поддержки touch-событий.

**dnd-kit** по умолчанию имеет встроенную поддержку тач-устройств, но требует правильной настройки сенсоров.

## Решение

### 1. Общий хук для сенсоров `useDndSensors`

**Расположение:** `src/shared/lib/useDndSensors.ts`

Переиспользуемый хук, который настраивает три типа сенсоров:

- **MouseSensor** — для десктопа (мышь)
- **TouchSensor** — для мобильных (касания пальцем)
- **KeyboardSensor** — для доступности (управление с клавиатуры)

```typescript
const sensors = useDndSensors({
  mouseDistance: 5,        // минимальное перемещение для активации
  touchDelay: 150,         // задержка перед началом перетаскивания
  touchTolerance: 5,       // допуск для отличия от скролла
});
```

### 2. Использование в Tabs (вкладки)

**Файл:** `src/features/dashboard/ui/components/Tabs.tsx`

```typescript
import { useDndSensors } from 'shared/lib/useDndSensors';

const sensors = useDndSensors();
```

Работает из коробки — вкладки перетаскиваются и на десктопе, и на мобильных.

### 3. Обертка для ReactFlow (графы заметок)

**Файл:** `src/features/graph/ui/components/TouchEnabledGraph.tsx`

Компонент-обертка, которая добавляет поддержку тач-перетаскивания для ReactFlow:

```typescript
<TouchEnabledGraph
  nodes={nodes}
  onNodePositionChange={handlePositionChange}
  disabled={!isMobile}  // на десктопе используется нативный ReactFlow
>
  <ReactFlow ... />
</TouchEnabledGraph>
```

**Как работает:**

1. На **мобильных** (`isMobile === true`):
   - `TouchSensor` из dnd-kit перехватывает тач-события
   - При окончании перетаскивания вызывается `onNodePositionChange`
   - Позиция ноды обновляется через существующую логику графа

2. На **десктопе** (`disabled === true`):
   - Обертка прозрачна, используется нативное поведение ReactFlow
   - Мышь работает напрямую через ReactFlow API

### 4. Разблокировка графов на мобильных

**Файл:** `src/features/dashboard/ui/components/DashboardContent.tsx`

**Было:**

```typescript
if (!isMobile) {
  if (activeTab.item.type === 'layout' || activeTab.item.type === 'graph') {
    return <NotesGraph ... />;
  }
}
```

**Стало:**

```typescript
if (activeTab.item.type === 'layout' || activeTab.item.type === 'graph') {
  return <NotesGraph ... />;
}
```

Теперь графы работают на всех устройствах.

## Архитектурные преимущества

✅ **Декомпозиция** — логика сенсоров вынесена в shared хук  
✅ **Переиспользование** — один хук для вкладок и графов  
✅ **Изоляция** — обертка не влияет на внутреннюю логику ReactFlow  
✅ **Условность** — на десктопе ReactFlow работает нативно (без оверхеда)  
✅ **Масштабируемость** — легко добавить dnd в другие места

## Почему dnd-kit для тач-поддержки?

1. **Специализация** — разработана с учетом тач-устройств
2. **Унификация** — одна библиотека для всех типов перетаскивания
3. **Надежность** — различает скролл и перетаскивание через `activationConstraint`
4. **Готовое решение** — не нужно писать обработку touch-событий вручную

## Настройка под разные кейсы

### Быстрое срабатывание (вкладки)

```typescript
useDndSensors({
  mouseDistance: 5,
  touchDelay: 150,
  touchTolerance: 5,
});
```

### Медленное срабатывание (графы, где важен скролл)

```typescript
useDndSensors({
  mouseDistance: 8,
  touchDelay: 200,
  touchTolerance: 8,
});
```

## Дальнейшие улучшения

- [ ] Добавить визуальный feedback при перетаскивании на мобильных (тень, масштаб)
- [ ] Оптимизировать производительность для больших графов (виртуализация)
- [ ] Добавить жесты (pinch-to-zoom для мобильных графов)
