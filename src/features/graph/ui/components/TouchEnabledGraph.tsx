import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useDndSensors } from 'shared/lib/useDndSensors';
import { useCallback, type ReactNode } from 'react';
import type { Node } from 'reactflow';

interface TouchEnabledGraphProps {
  children: ReactNode;
  nodes: Node[];
  onNodePositionChange?: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
  disabled?: boolean;
}

export const TouchEnabledGraph = ({
  children,
  nodes,
  onNodePositionChange,
  disabled = false,
}: TouchEnabledGraphProps) => {
  const sensors = useDndSensors({
    mouseDistance: 8,
    touchDelay: 200,
    touchTolerance: 8,
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;

      if (!onNodePositionChange || !delta) return;

      const nodeId = active.id as string;
      const node = nodes.find(n => n.id === nodeId);

      if (!node) return;

      const newPosition = {
        x: node.position.x + delta.x,
        y: node.position.y + delta.y,
      };

      onNodePositionChange(nodeId, newPosition);
    },
    [nodes, onNodePositionChange]
  );

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
};
