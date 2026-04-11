import type { UseGraphHistoryReturn } from '@/entities/graph';
import type { Note } from '@/entities/note';
import { useCallback, useEffect, type MouseEvent, type RefObject } from 'react';
import type { Edge, Node, NodeChange } from 'reactflow';
import { useGraphConnectionHandlers } from '../../model/hooks/useGraphConnectionHandlers';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphDragHandlers } from '../../model/hooks/useGraphDragHandlers';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useGraphSelectionHandlers } from '../../model/hooks/useGraphSelectionHandlers';
import { useGraphSyncHandlers } from '../../model/hooks/useGraphSyncHandlers';
import { useEdgeDeleteEvents } from './useEdgeDeleteEvents';

interface UseGraphContentHandlersProps {
  layoutId: string;
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  edges: Edge[];
  setEdgesState: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  updatePositionCallback: (
    nodeId: string,
    x: number,
    y: number
  ) => Promise<void>;
  onNodeClick: (nodeId: string) => void;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: () => void;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  graphHistory: UseGraphHistoryReturn;
  isProcessingRef: RefObject<boolean>;
  isNodeDraggingRef: RefObject<boolean>;
  rfSetNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  rfSetEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setIsNodeDragging: (isDragging: boolean) => void;
  canEdit?: boolean;
}

export const useGraphContentHandlers = ({
  layoutId,
  nodes,
  setNodes,
  edges,
  setEdgesState,
  onNodesChange,
  selectedNodeId,
  hoveredNodeId,
  updatePositionCallback,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onNoteOpen,
  screenToFlowPosition,
  graphHistory,
  isProcessingRef,
  isNodeDraggingRef,
  rfSetNodes,
  rfSetEdges,
  setIsNodeDragging,
  canEdit = true,
}: UseGraphContentHandlersProps) => {
  const {
    handleNodeDragStart,
    handleNodeDragStop,
    handleNodesChange: _handleNodesChange,
  } = useGraphDragHandlers({
    nodes,
    setNodes,
    updatePositionCallback,
    graphHistory,
    isNodeDraggingRef,
    isProcessingRef,
    rfSetNodes,
    onNodeDragStop: undefined,
    setIsNodeDragging,
    onNodesChange,
    rfSetEdges,
  });

  const {
    tempEdges,
    allEdges,
    tempEdge,
    retractLine: connectRetractLine,
    onConnectStart,
    onConnectEnd,
    onConnect: onConnectOriginal,
    setTempEdges,
  } = useGraphConnections({
    layoutId,
    canEdit,
    nodes,
    edges,
    selectedNodeId,
    hoveredNodeId,
    screenToFlowPosition,
    onEdgeCreated: newEdge => {
      setEdgesState(prev => {
        if (prev.some(e => e.id === newEdge.id)) return prev;
        return [...prev, newEdge];
      });
    },
  });

  const {
    onConnect,
    handleEdgeDeleteDrop,
    handleEdgeDeleteStart,
    isDraggingEdge,
    edgeDragSourceId,
    edgeDragOriginalTargetId,
    retractLine: edgeRetractLine,
  } = useGraphConnectionHandlers({
    layoutId,
    nodes,
    edges,
    setEdges: setEdgesState,
    tempEdges,
    setTempEdges,
    graphHistory,
    onConnectOriginal,
    isProcessingRef,
  });

  useEffect(() => {
    if (tempEdges.length > 0) {
      setTempEdges(prev =>
        prev.filter(tempEdge => !edges.some(edge => edge.id === tempEdge.id))
      );
    }
  }, [edges, tempEdges.length, setTempEdges]);

  useEdgeDeleteEvents(handleEdgeDeleteDrop, handleEdgeDeleteStart);

  const { handleNodeDoubleClick, handleNoteDrop } = useGraphSelectionHandlers({
    screenToFlowPosition,
    handleAddNoteToGraph: undefined,
  });

  const { handleNoteOpen } = useGraphSyncHandlers({
    nodes,
    onNoteOpen,
    isDraggingEdge,
  });

  const {
    handleAddNoteToGraph: handleAddNoteToGraphOrig,
    onNodeDragStop: _onNodeDragStop,
    handleNodesChange: _handleNodesChangeOrig,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
  } = useGraphHandlers({
    updatePositionCallback,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onNodesChange,
    screenToFlowPosition,
  });

  const handleAddNoteToGraph = useCallback(
    (note: Note, dropPosition?: { x: number; y: number }) => {
      if (!canEdit) return;
      handleAddNoteToGraphOrig?.(note, dropPosition);
    },
    [canEdit, handleAddNoteToGraphOrig]
  );

  const handleNodeMouseEnterWrapped = useCallback(
    (e: MouseEvent, node: Node) => {
      if (isNodeDraggingRef.current) return;
      handleNodeMouseEnter(e, node);
    },
    [handleNodeMouseEnter, isNodeDraggingRef]
  );

  const handleNodeMouseLeaveWrapped = useCallback(
    (e: MouseEvent, node: Node) => {
      if (isNodeDraggingRef.current) return;
      handleNodeMouseLeave(e, node);
    },
    [handleNodeMouseLeave, isNodeDraggingRef]
  );

  return {
    state: {
      isDraggingEdge,
      tempEdges,
      allEdges,
      tempEdge,
      retractLine: edgeRetractLine ?? connectRetractLine,
      edgeDragSourceId,
      edgeDragOriginalTargetId,
    },
    actions: {
      handleNodeDragStart,
      handleNodeDragStop,
      handleNodesChange: _handleNodesChange,
      onConnect,
      onConnectStart,
      onConnectEnd,
      handleNodeDoubleClick,
      handleNoteDrop,
      handleAddNoteToGraph,
      handleNodeClick,
      handleNodeMouseEnterWrapped,
      handleNodeMouseLeaveWrapped,
      handleNoteOpen,
    },
  };
};
