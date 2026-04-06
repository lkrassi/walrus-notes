import { getLayoutAccess, useGetMyLayoutsQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { useGraphContentHandlers, useGraphState } from '../../lib/hooks';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { NotesGraphView } from './NotesGraphView';

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
  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
  const currentLayout = (layoutsResponse?.data || []).find(
    l => l.id === layoutId
  );
  const access = currentLayout
    ? getLayoutAccess(currentLayout)
    : { canRead: true, canWrite: true, canEdit: true };
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
  } = useNotesGraph({ layoutId });

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

  const {
    handleNodeDragStart,
    handleNodeDragStop,
    handleNodesChange,
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
    isDraggingEdge,
    tempEdges,
    allEdges,
  } = useGraphContentHandlers({
    layoutId,
    nodes,
    setNodes,
    edges,
    setEdgesState,
    onNodesChange,
    onEdgesChange,
    selectedNodeId,
    hoveredNodeId,
    updatePositionCallback,
    onNodeClick: onNodeClick,
    onNodeMouseEnter: onNodeMouseEnter,
    onNodeMouseLeave: onNodeMouseLeave,
    onPaneClick,
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

  const { edgesWithSelection, nodesWithSelection } = useGraphSelection({
    nodes,
    edges,
    tempEdges,
    selectedNodeId,
    hoveredNodeId,
    allEdges,
  });

  if (isInitialLoading) {
    return <div className={cn('h-full', 'space-y-3 p-4')}></div>;
  }

  return (
    <NotesGraphView
      layoutId={layoutId}
      isRefreshing={isRefreshing}
      allowNodeDrag={allowNodeDrag && canWrite}
      nodes={nodes}
      edges={edges}
      nodesWithSelection={nodesWithSelection}
      edgesWithSelection={edgesWithSelection}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={canWrite ? onConnect : undefined}
      onConnectStart={canWrite ? onConnectStart : undefined}
      onConnectEnd={canWrite ? onConnectEnd : undefined}
      onNodeDragStart={canWrite ? handleNodeDragStart : undefined}
      onNodeDragStop={canWrite ? handleNodeDragStop : undefined}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnterWrapped}
      onNodeMouseLeave={handleNodeMouseLeaveWrapped}
      disableZoomDuringDrag={isNodeDragging}
      onPaneClick={onPaneClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      isDraggingEdge={isDraggingEdge}
      onDrop={canWrite ? handleNoteDrop : () => {}}
      onBoxSelect={canWrite ? handleBoxSelect : undefined}
      onAddNoteToGraph={canWrite ? handleAddNoteToGraph : () => {}}
      screenToFlowPosition={screenToFlowPosition}
      isMain={isMain}
      graphHistory={graphHistory}
      canEdit={canWrite}
      onNoteOpenPinned={onNoteOpenPinned}
    />
  );
});
