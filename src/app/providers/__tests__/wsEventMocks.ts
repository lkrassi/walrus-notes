/**
 * Test utilities for mocking WebSocket events.
 * Use in browser console or integration tests to simulate server events.
 */

export interface MockWSEvent {
  event: string;
  payload: Record<string, unknown>;
}

export const createMockLayoutDeleteEvent = (layoutId: string): MockWSEvent => ({
  event: 'DELETE_LAYOUT',
  payload: { layoutId, actorId: 'other-user-id' },
});

export const createMockLayoutUpdateEvent = (layoutId: string): MockWSEvent => ({
  event: 'UPDATE_LAYOUT',
  payload: { layoutId, actorId: 'other-user-id' },
});

export const createMockNoteCreateEvent = (
  noteId: string,
  layoutId: string
): MockWSEvent => ({
  event: 'CREATE_NOTE',
  payload: { noteId, layoutId, actorId: 'other-user-id' },
});

export const createMockNoteDeleteEvent = (noteId: string): MockWSEvent => ({
  event: 'DELETE_NOTE',
  payload: { noteId, actorId: 'other-user-id' },
});

export const createMockNoteUpdateEvent = (noteId: string): MockWSEvent => ({
  event: 'UPDATE_NOTE',
  payload: { noteId, actorId: 'other-user-id' },
});

export const createMockNotePositionChangeEvent = (
  noteId: string
): MockWSEvent => ({
  event: 'CHANGE_NOTE_POSITION',
  payload: { noteId, actorId: 'other-user-id' },
});

export const createMockNoteLinkChangeEvent = (noteId: string): MockWSEvent => ({
  event: 'CHANGE_NOTE_LINKS',
  payload: { noteId, actorId: 'other-user-id' },
});

export const createMockNoteDragEvent = (noteId: string): MockWSEvent => ({
  event: 'DRAG_NOTE',
  payload: { noteId, actorId: 'other-user-id' },
});

/**
 * Helper to manually trigger WS event handlers for testing.
 * Get a reference to your WebSocket instance and call this function.
 *
 * Example in browser console:
 * const lastJsonMessage = { event: 'DELETE_NOTE', payload: { noteId: 'abc123' } };
 * // Manually invoke the listener on your WS instance
 *
 * In actual integration tests, you'd mock the WebSocket connection.
 */
export const createMockWSEvent = (
  eventName: string,
  payload: Record<string, unknown>
): MockWSEvent => ({
  event: eventName,
  payload,
});
