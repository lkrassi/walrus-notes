import type { Note } from '@/entities/note';
import { useDndSensors } from '@/shared/lib/react/hooks';
import {
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useCallback, useState } from 'react';
import { useGraphDragAndDrop } from './useGraphDragAndDrop';

const DND_OVERLAY_MODIFIERS = [snapCenterToCursor];

export const useGraphDndOrchestration = ({
  onAddNoteToGraph,
  screenToFlowPosition,
  centerCoords,
}: {
  onAddNoteToGraph?: (note: Note, position?: { x: number; y: number }) => void;
  screenToFlowPosition?: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  centerCoords: { x: number; y: number } | null;
}) => {
  const sensors = useDndSensors({
    mouseDistance: 5,
    touchDelay: 100,
    touchTolerance: 5,
  });

  const {
    activeDragNote,
    activeDragId,
    activeDragSize,
    handleDndDragStart,
    handleDndDragEnd,
  } = useGraphDragAndDrop({
    onAddNoteToGraph,
    screenToFlowPosition,
    centerCoords,
  });

  const [lastDndDropAt, setLastDndDropAt] = useState<number | null>(null);

  const collisionDetection = useCallback<CollisionDetection>(args => {
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length === 0) {
      return closestCenter(args);
    }

    const unposedCollisions = pointerCollisions.filter(collision => {
      const collisionId = collision.id.toString();
      return (
        collisionId === 'unposed-panel-drop' ||
        collisionId === 'unposed-grid-drop' ||
        collisionId.startsWith('unposed-')
      );
    });

    if (unposedCollisions.length > 0) {
      return unposedCollisions;
    }

    const graphCollision = pointerCollisions.find(
      collision => collision.id.toString() === 'graph-drop-zone'
    );

    if (graphCollision) {
      return [graphCollision];
    }

    return pointerCollisions;
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      try {
        handleDndDragEnd(event);
      } finally {
        setLastDndDropAt(Date.now());
      }
    },
    [handleDndDragEnd]
  );

  return {
    sensors,
    collisionDetection,
    onDragStart: handleDndDragStart,
    onDragEnd,
    activeDragNote,
    activeDragId,
    activeDragSize,
    lastDndDropAt,
    dragOverlayModifiers: DND_OVERLAY_MODIFIERS,
  };
};
