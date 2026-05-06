# WebSocket Events Handler - Real-time Layout/Note Sync

## Overview

This implementation adds real-time synchronization for shared layouts and notes. When another user performs changes to a layout or note that you have access to, you'll receive WebSocket events and your local UI will update accordingly.

## Architecture

```
Server → WebSocket → useWebSocket (shared)
                  ↓
          WSEventsProvider (app/providers) - centralized handler
                  ↓
         [Cache Invalidation & Local State Updates]
                  ↓
         [FileTree + Tabs + RTK Query]
                  ↓
         [UI Components Auto-Refetch/Re-render]
```

## Files Modified/Created

### New Files

- **[src/app/providers/wsEventsProvider.tsx](src/app/providers/wsEventsProvider.tsx)** — Main WS event handler component with all 8 event types
- **[src/app/providers/**tests**/wsEventMocks.ts](src/app/providers/__tests__/wsEventMocks.ts)** — Mock event creators for testing

### Modified Files

- **[src/App.tsx](src/App.tsx)** — Added `<WSEventsProvider>` wrapper (mounted after `AuthSyncProvider`)

### Unchanged

- [src/shared/lib/react/websocket/WebSocketProvider.tsx](src/shared/lib/react/websocket/WebSocketProvider.tsx) — Still just provides WS context, no handler mounted here

## Event Types & Handling Rules

| Event                  | Payload                         | Action                                                            | Refetch?         |
| ---------------------- | ------------------------------- | ----------------------------------------------------------------- | ---------------- |
| `DELETE_LAYOUT`        | `layoutId`, `actorId`           | Remove from FileTree, close all tabs (layout + its notes + graph) | ❌ No            |
| `UPDATE_LAYOUT`        | `layoutId`, `actorId`           | Invalidate `Layouts` & `Notes` caches                             | ✅ Yes           |
| `CREATE_NOTE`          | `noteId`, `layoutId`, `actorId` | Invalidate `Notes` cache                                          | ✅ Yes           |
| `DELETE_NOTE`          | `noteId`, `actorId`             | Remove from FileTree, close note tabs                             | ❌ No            |
| `UPDATE_NOTE`          | `noteId`, `actorId`             | Invalidate `Notes` cache                                          | ✅ Yes           |
| `CHANGE_NOTE_POSITION` | `noteId`, `actorId`             | Debounce (300ms) + invalidate `Notes`                             | ✅ Yes (batched) |
| `CHANGE_NOTE_LINKS`    | `noteId`, `actorId`             | Debounce (300ms) + invalidate `Notes`                             | ✅ Yes (batched) |
| `DRAG_NOTE`            | `noteId`, `actorId`             | Invalidate `Notes` cache                                          | ✅ Yes           |

## Key Implementation Details

### 1. Event Filtering

- Events where `actorId === currentUserId` are **ignored** (avoid duplicate feedback)
- Prevent self-triggered events from being processed

### 2. Debouncing Graph Events

- `CHANGE_NOTE_POSITION` and `CHANGE_NOTE_LINKS` are batched with 300ms debounce
- Multiple rapid graph changes (300ms window) → single cache invalidation
- Prevents excessive refetch calls during rapid graph manipulation

### 3. Local UI Updates (No Refetch)

For DELETE events, we use existing Redux actions:

- `removeLayoutFromTree()` / `removeNoteFromTree()` — Removes items from FileTree
- `closeLayoutTabs()` / `closeTabsByItemId()` — Closes open tabs
- Immediate UI update without waiting for server response

### 4. Cache Invalidation (With Refetch)

For CREATE/UPDATE events, we dispatch RTK Query tags:

- `layoutApi.util.invalidateTags(['Layouts', 'Notes'])` — For layout changes
- `notesApi.util.invalidateTags(['Notes'])` — For note changes
- Components using these endpoints automatically refetch and re-render

## Usage Flow

### For End Users

1. User A shares a layout with User B
2. User A deletes a note from that layout
3. User B receives `DELETE_NOTE` event with the noteId
4. User B's UI immediately updates: note removed from sidebar, tab closed if open
5. No error message, seamless UX

### For Developers (Testing)

Use the mock event helpers in browser console:

```javascript
// Import from dev build
import {
  createMockNoteDeleteEvent,
  createMockLayoutUpdateEvent,
} from 'app/providers/__tests__/wsEventMocks.ts';

// Create mock event
const event = createMockNoteDeleteEvent('note-id-123');
console.log(event);
// { event: 'DELETE_NOTE', payload: { noteId: 'note-id-123', actorId: 'other-user-id' } }

// In production, events come from server via WebSocket
```

## Error Handling

- Invalid/missing payloads (e.g., no noteId/layoutId) → logged as warning, event ignored
- File tree operations errors → logged to console, partial UI state maintained
- Cache invalidation failures → handled by RTK Query's existing retry logic

## Performance Considerations

1. **Debouncing**: Graph events batched to avoid cascading refetches
2. **Selective Invalidation**: Only invalidate tags affected by the event type (not all queries)
3. **Local State**: DELETE events use local mutations (no server round-trip)
4. **User Self-Events**: Ignored to prevent echo feedback

## Future Enhancements

- [ ] Add feature flag to enable/disable WS events processing
- [ ] Add metrics/telemetry (event count, latency, errors)
- [ ] Implement exponential backoff for failed invalidations
- [ ] Add user notifications ("X deleted this note while you were viewing it")
- [ ] Add event versioning to handle backward compatibility
- [ ] Support partial refetch (fetch only affected notes/layouts, not full list)

## Monitoring & Debugging

Enable logging by setting in DevTools console:

```javascript
localStorage.setItem('DEBUG_WS_EVENTS', 'true');
// Look for logs: [WSEventsHandler] DELETE_NOTE, [WSEventsHandler] CREATE_NOTE, etc.
```

## Integration Points

- **WebSocket**: Connected in `Main` component via `WebSocketProvider`
- **FileTree**: Uses `useFileTree()` hooks for local sidebar updates
- **Tabs**: Dispatches Redux actions from `entities/tab` reducer
- **RTK Query**: Invalidates tags on `layoutApi` and `notesApi`
- **Redux**: Uses `useAppDispatch()` for all state changes

## Testing Strategy

### Unit Tests (Todo)

- Mock `useWSContext`, `useFileTree`, `useAppDispatch`
- Verify event handlers call correct functions with correct args
- Verify debouncing works correctly for graph events

### E2E Tests (Todo)

- Mock WebSocket server
- Send real events
- Verify UI updates (sidebar, tabs, content)
- Verify RTK Query cache invalidation triggers refetch

### Manual Testing Checklist

- [ ] Delete layout → other user sees it removed + tabs closed
- [ ] Delete note → other user sees sidebar updated + tab closed
- [ ] Create note → other user sees new note appear in list
- [ ] Rapid graph changes → debounce batches into one refetch
- [ ] Ignore self-events → no duplicate operations
- [ ] Permission boundaries respected → user sees only shared items
