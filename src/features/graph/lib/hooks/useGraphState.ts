import { useGraphHistory } from '@/entities/graph';
import { useState } from 'react';
import type { Edge, Node } from 'reactflow';
import { useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import { useGraphInitialization } from '../../model/hooks/useGraphInitialization';

interface UseGraphStateProps {
  layoutId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

export const useGraphState = ({
  layoutId,
  initialNodes,
  initialEdges,
}: UseGraphStateProps) => {
  const {
    screenToFlowPosition,
    getEdges: _getEdges,
    getNodes: _getNodes,
    setNodes: rfSetNodes,
    setEdges: rfSetEdges,
  } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
  const [isNodeDragging, setIsNodeDragging] = useState(false);

  const graphHistory = useGraphHistory(100);

  const { isProcessingRef, isNodeDraggingRef } = useGraphInitialization({
    layoutId,
    initialNodes,
    initialEdges,
    nodes,
    edges,
    setNodes,
    setEdges: setEdgesState,
  });

  return {
    screenToFlowPosition,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdgesState,
    onEdgesChange,
    isNodeDragging,
    setIsNodeDragging,
    graphHistory,
    isProcessingRef,
    isNodeDraggingRef,
    rfSetNodes,
    rfSetEdges,
  };
};
