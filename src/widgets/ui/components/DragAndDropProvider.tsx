import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DragItem } from 'widgets/hooks';

interface DragAndDropContextType {
  isDragging: boolean;
  draggedItem: DragItem | null;
  setIsDragging: (dragging: boolean) => void;
  setDraggedItem: (item: DragItem | null) => void;
}

const DragAndDropContext = createContext<DragAndDropContextType | null>(null);

export const useDragAndDropContext = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDropContext must be used within DragAndDropProvider');
  }
  return context;
};

interface DragAndDropProviderProps {
  children: React.ReactNode;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const value = {
    isDragging,
    draggedItem,
    setIsDragging,
    setDraggedItem,
  };

  return (
    <DragAndDropContext.Provider value={value}>
      {children}
    </DragAndDropContext.Provider>
  );
};
