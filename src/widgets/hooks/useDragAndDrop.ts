import { useState, useCallback, useRef } from 'react';

export interface DragItem {
  id: string;
  type: string;
  data?: any;
}

export interface DropZone {
  id: string;
  accepts: string[];
  onDrop: (item: DragItem) => void;
}

export interface UseDragAndDropOptions {
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem) => void;
  onDrop?: (item: DragItem, dropZoneId: string) => void;
}

export const useDragAndDrop = (options: UseDragAndDropOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((item: DragItem) => {
    setIsDragging(true);
    setDraggedItem(item);
    options.onDragStart?.(item);
  }, [options]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (draggedItem) {
      options.onDragEnd?.(draggedItem);
      setDraggedItem(null);
    }
  }, [draggedItem, options]);

  const handleDrop = useCallback((dropZoneId: string) => {
    if (draggedItem) {
      options.onDrop?.(draggedItem, dropZoneId);
      setDraggedItem(null);
      setIsDragging(false);
    }
  }, [draggedItem, options]);

  const createDraggableProps = useCallback((item: DragItem) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('application/json', JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'move';
      handleDragStart(item);
    },
    onDragEnd: handleDragEnd,
  }), [handleDragStart, handleDragEnd]);

  const createDropZoneProps = useCallback((dropZone: DropZone) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const item: DragItem = JSON.parse(e.dataTransfer.getData('application/json'));
        if (dropZone.accepts.includes(item.type)) {
          dropZone.onDrop(item);
          handleDrop(dropZone.id);
        }
      } catch (error) {
        console.error('Failed to parse drag data:', error);
      }
    },
  }), [handleDrop]);

  return {
    isDragging,
    draggedItem,
    createDraggableProps,
    createDropZoneProps,
    dragRef,
  };
};
