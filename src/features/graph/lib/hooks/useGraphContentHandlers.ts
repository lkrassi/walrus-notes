import type { UseGraphHistoryReturn } from '@/entities/graph';
import { useGraphConnectionHandlers } from '../../model/hooks/useGraphConnectionHandlers';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphDragHandlers } from '../../model/hooks/useGraphDragHandlers';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useGraphSelectionHandlers } from '../../model/hooks/useGraphSelectionHandlers';
import { useGraphSyncHandlers } from '../../model/hooks/useGraphSyncHandlers';
import { useEdgeDeleteEvents } from './useEdgeDeleteEvents';
import type { Note } from '@/shared/model';
import { useCallback, useEffect, type MouseEvent, type RefObject } from 'react';
import type { Edge, EdgeChange, Node, NodeChange } from 'reactflow';

interface UseGraphContentHandlersProps {
  layoutId: string;
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  edges: Edge[];
  setEdgesState: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
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
  onPaneClick: (event: MouseEvent) => void;
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
}

export const useGraphContentHandlers = ({
  layoutId,
  nodes,
  setNodes,
  edges,
  setEdgesState,
  onNodesChange,
  onEdgesChange: _onEdgesChange,
  selectedNodeId,
  hoveredNodeId,
  updatePositionCallback,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneClick: _onPaneClick,
  onNoteOpen,
  screenToFlowPosition,
  graphHistory,
  isProcessingRef,
  isNodeDraggingRef,
  rfSetNodes,
  rfSetEdges,
  setIsNodeDragging,
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
    onConnectStart,
    onConnectEnd,
    onConnect: onConnectOriginal,
    setTempEdges,
  } = useGraphConnections({
    layoutId,
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

  const { handleNodeDoubleClick, handleNoteDrop, handleBoxSelect } =
    useGraphSelectionHandlers({
      nodes,
      setNodes,
      lastBoxSelectedIdsRef: { current: new Set() },
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
      handleAddNoteToGraphOrig?.(note, dropPosition);
    },
    [handleAddNoteToGraphOrig]
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
    handleNodeDragStart,
    handleNodeDragStop,
    handleNodesChange: _handleNodesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    handleNodeDoubleClick,
    handleNoteDrop,
    handleBoxSelect,
    handleAddNoteToGraph,
    handleNodeClick,
    handleNodeMouseEnterWrapped,
    handleNodeMouseLeaveWrapped,
    handleNoteOpen,
    isDraggingEdge,
    tempEdges,
    allEdges,
  };
};
