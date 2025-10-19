import React from 'react';
import { useDragAndDropContext } from './DragAndDropProvider';
import type { DragItem } from 'widgets/hooks';

interface DropZoneProps {
  accepts: string[];
  onDrop: (item: DragItem, event?: React.DragEvent) => void;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  accepts,
  onDrop,
  children,
  className = '',
  activeClassName = '',
}) => {
  const { isDragging, draggedItem } = useDragAndDropContext();

  const isValidDrop = draggedItem && accepts.includes(draggedItem.type);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isValidDrop) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isValidDrop) return;

    try {
      const item: DragItem = JSON.parse(e.dataTransfer.getData('application/json'));
      if (accepts.includes(item.type)) {
        onDrop(item, e);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  };

  const combinedClassName = `${className} ${
    isDragging && isValidDrop ? activeClassName : ''
  }`.trim();

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={combinedClassName}
    >
      {children}
    </div>
  );
};
