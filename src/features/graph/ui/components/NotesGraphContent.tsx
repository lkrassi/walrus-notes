import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo, useMemo } from 'react';
import { GraphProvider } from '../../lib/context';
import { useGraphContentHandlers, useGraphState } from '../../lib/hooks';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { useNotesGraphData } from '../../model/hooks/useNotesGraphData';
import { NotesGraphView } from './NotesGraphView';

const noopNodeDragStop = () => {};

interface NotesGraphContentProps {
  layoutId: string;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  onNoteOpenPinned?: (noteData: { noteId: string; note: Note }) => void;
  allowNodeDrag?: boolean;
  isMain?: boolean;
}

export const NotesGraphContent = memo(function NotesGraphContent({
  layoutId,
  onNoteOpen,
  onNoteOpenPinned,
  allowNodeDrag,
  isMain,
}: NotesGraphContentProps) {
  const { data: access } = useNotesGraphData({ layoutId });
  const canWrite = access.canWrite;
  const {
    isInitialLoading,
    isRefreshing,
    initialNodes,
    initialEdges,
    selectedNodeId,
    hoveredNodeId,
    updatePositionCallback,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPaneClick,
  } = useNotesGraph({ layoutId, isMain });

  const {
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
  } = useGraphState({
    layoutId,
    initialNodes,
    initialEdges,
  });

  const { state: graphHandlersState, actions: graphHandlersActions } =
    useGraphContentHandlers({
      layoutId,
      nodes,
      setNodes,
      edges,
      setEdgesState,
      onNodesChange,
      selectedNodeId,
      hoveredNodeId,
      updatePositionCallback,
      onNodeClick: onNodeClick,
      onNodeMouseEnter: onNodeMouseEnter,
      onNodeMouseLeave: onNodeMouseLeave,
      onNoteOpen,
      screenToFlowPosition,
      graphHistory,
      isProcessingRef,
      isNodeDraggingRef,
      rfSetNodes,
      rfSetEdges,
      setIsNodeDragging,
      canEdit: canWrite,
    });

  const connectionPreviewInvalidNodeIds = useMemo(() => {
    const invalid = new Set<string>();

    const creatingSourceId = graphHandlersState.tempEdge?.source;
    if (typeof creatingSourceId === 'string' && creatingSourceId.length > 0) {
      graphHandlersState.allEdges.forEach(edge => {
        if (edge.source === creatingSourceId) {
          invalid.add(edge.target);
        }
      });
    }

    const movingSourceId = graphHandlersState.edgeDragSourceId;
    if (typeof movingSourceId === 'string' && movingSourceId.length > 0) {
      graphHandlersState.allEdges.forEach(edge => {
        if (edge.source !== movingSourceId) {
          return;
        }

        const isCurrentlyMovedEdgeTarget =
          edge.target === graphHandlersState.edgeDragOriginalTargetId;
        if (!isCurrentlyMovedEdgeTarget) {
          invalid.add(edge.target);
        }
      });
    }

    return Array.from(invalid);
  }, [
    graphHandlersState.allEdges,
    graphHandlersState.edgeDragOriginalTargetId,
    graphHandlersState.edgeDragSourceId,
    graphHandlersState.tempEdge?.source,
  ]);

  const hoveredInvalidConnectionTargetIds = useMemo(() => {
    const hoveredPreviewNodeId = graphHandlersState.isDraggingEdge
      ? graphHandlersState.edgeDragHoveredTargetId
      : hoveredNodeId;

    if (!hoveredPreviewNodeId) {
      return [] as string[];
    }

    if (connectionPreviewInvalidNodeIds.includes(hoveredPreviewNodeId)) {
      return [hoveredPreviewNodeId];
    }

    if (
      graphHandlersState.isDraggingEdge &&
      hoveredPreviewNodeId === graphHandlersState.edgeDragSourceId
    ) {
      return [hoveredPreviewNodeId];
    }

    return [] as string[];
  }, [
    connectionPreviewInvalidNodeIds,
    graphHandlersState.edgeDragHoveredTargetId,
    graphHandlersState.edgeDragSourceId,
    graphHandlersState.isDraggingEdge,
    hoveredNodeId,
  ]);

  const isConnectionPreviewActive =
    !!graphHandlersState.tempEdge || !!graphHandlersState.edgeDragSourceId;

  const { edgesWithSelection, nodesWithSelection } = useGraphSelection({
    nodes,
    edges,
    tempEdges: graphHandlersState.tempEdges,
    selectedNodeId,
    hoveredNodeId,
    allEdges: graphHandlersState.allEdges,
    isConnectionPreviewActive,
    invalidConnectionTargetIds: hoveredInvalidConnectionTargetIds,
  });

  const graphContextState = useMemo(
    () => ({
      layoutId,
      isRefreshing,
      nodesWithSelection,
      edgesWithSelection,
      screenToFlowPosition,
      disableZoomDuringDrag: isNodeDragging,
      allowNodeDrag: !!allowNodeDrag && canWrite,
      isDraggingEdge: graphHandlersState.isDraggingEdge,
      retractLine: graphHandlersState.retractLine,
      isMain,
      graphHistory,
      canEdit: canWrite,
      onNoteOpenPinned,
    }),
    [
      allowNodeDrag,
      canWrite,
      edgesWithSelection,
      graphHandlersState.isDraggingEdge,
      graphHandlersState.retractLine,
      graphHistory,
      isMain,
      isNodeDragging,
      isRefreshing,
      layoutId,
      nodesWithSelection,
      onNoteOpenPinned,
      screenToFlowPosition,
    ]
  );

  const graphContextActions = useMemo(
    () => ({
      onNodesChange: graphHandlersActions.handleNodesChange,
      onEdgesChange,
      onConnect: canWrite ? graphHandlersActions.onConnect : undefined,
      onConnectStart: canWrite
        ? graphHandlersActions.onConnectStart
        : undefined,
      onConnectEnd: canWrite ? graphHandlersActions.onConnectEnd : undefined,
      onNodeDragStart: canWrite
        ? graphHandlersActions.handleNodeDragStart
        : undefined,
      onNodeDragStop: canWrite
        ? graphHandlersActions.handleNodeDragStop
        : noopNodeDragStop,
      onNodeClick: graphHandlersActions.handleNodeClick,
      onNodeMouseEnter: graphHandlersActions.handleNodeMouseEnterWrapped,
      onNodeMouseLeave: graphHandlersActions.handleNodeMouseLeaveWrapped,
      onNodeDoubleClick: graphHandlersActions.handleNodeDoubleClick,
      onDrop: canWrite ? graphHandlersActions.handleNoteDrop : () => {},
      onPaneClick,
      onAddNoteToGraph: canWrite
        ? graphHandlersActions.handleAddNoteToGraph
        : () => {},
    }),
    [
      canWrite,
      graphHandlersActions.handleAddNoteToGraph,
      graphHandlersActions.handleNodeClick,
      graphHandlersActions.handleNodeDoubleClick,
      graphHandlersActions.handleNodeDragStart,
      graphHandlersActions.handleNodeDragStop,
      graphHandlersActions.handleNodeMouseEnterWrapped,
      graphHandlersActions.handleNodeMouseLeaveWrapped,
      graphHandlersActions.handleNodesChange,
      graphHandlersActions.handleNoteDrop,
      graphHandlersActions.onConnect,
      graphHandlersActions.onConnectEnd,
      graphHandlersActions.onConnectStart,
      onEdgesChange,
      onPaneClick,
    ]
  );

  if (isInitialLoading) {
    return <div className={cn('h-full', 'space-y-3 p-4')}></div>;
  }

  return (
    <GraphProvider state={graphContextState} actions={graphContextActions}>
      <NotesGraphView />
    </GraphProvider>
  );
});
