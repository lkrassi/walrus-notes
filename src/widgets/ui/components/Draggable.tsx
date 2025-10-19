import React from 'react';
import { useDragAndDropContext } from './DragAndDropProvider';
import type { DragItem } from 'widgets/hooks';

interface DraggableProps {
  item: DragItem;
  children: React.ReactNode;
  className?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const Draggable: React.FC<DraggableProps> = ({
  item,
  children,
  className = '',
  onDragStart,
  onDragEnd,
}) => {
  const { setIsDragging, setDraggedItem } = useDragAndDropContext();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    setDraggedItem(item);
    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
    onDragEnd?.();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={className}
    >
      {children}
    </div>
  );
};
