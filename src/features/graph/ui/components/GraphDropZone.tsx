import React from 'react';

interface GraphDropZoneProps {
  onDrop: (event: React.DragEvent) => void;
  children: React.ReactNode;
  isDraggingEdge?: boolean;
}

export const GraphDropZone: React.FC<GraphDropZoneProps> = ({
  onDrop,
  children,
  isDraggingEdge = false,
}) => {
  return (
    <div
      className={`relative flex-1 ${
        isDraggingEdge
          ? 'cursor-no-drop bg-blue-50 ring-2 ring-blue-400 dark:bg-blue-900/20'
          : ''
      } transition-all duration-200`}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
    >
      {children}
    </div>
  );
};
