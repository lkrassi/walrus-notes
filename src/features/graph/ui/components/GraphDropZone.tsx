import React from 'react';

interface GraphDropZoneProps {
  onDrop: (event: React.DragEvent) => void;
  children: React.ReactNode;
}

export const GraphDropZone: React.FC<GraphDropZoneProps> = ({
  onDrop,
  children,
}) => {
  return (
    <div
      className='flex-1'
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
    >
      {children}
    </div>
  );
};
