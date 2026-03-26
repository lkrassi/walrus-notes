import { getLayoutAccess, useGetMyLayoutsQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { memo } from 'react';
import { useGraphContentHandlers, useGraphState } from '../../lib/hooks';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { NotesGraphView } from './NotesGraphView';

interface NotesGraphContentProps {
  layoutId: string;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  allowNodeDrag?: boolean;
  isMain?: boolean;
}

export const NotesGraphContent = memo(function NotesGraphContent({
  layoutId,
  onNoteOpen,
  allowNodeDrag,
  isMain,
}: NotesGraphContentProps) {
  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
  const currentLayout = (layoutsResponse?.data || []).find(l => l.id === layoutId);
  const canEdit = currentLayout ? getLayoutAccess(currentLayout).canEdit : true;
  const {
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
    handleNoteOpen,
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
    canEdit,
  });

  const { edgesWithSelection, nodesWithSelection } = useGraphSelection({
    nodes,
    edges,
    tempEdges,
    selectedNodeId,
    hoveredNodeId,
    allEdges,
    onNoteOpen: handleNoteOpen,
  });

  return (
    <NotesGraphView
      layoutId={layoutId}
      allowNodeDrag={allowNodeDrag && canEdit}
      nodes={nodes}
      edges={edges}
      nodesWithSelection={nodesWithSelection}
      edgesWithSelection={edgesWithSelection}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={canEdit ? onConnect : undefined}
      onConnectStart={canEdit ? onConnectStart : undefined}
      onConnectEnd={canEdit ? onConnectEnd : undefined}
      onNodeDragStart={canEdit ? handleNodeDragStart : undefined}
      onNodeDragStop={canEdit ? handleNodeDragStop : undefined}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnterWrapped}
      onNodeMouseLeave={handleNodeMouseLeaveWrapped}
      disableZoomDuringDrag={isNodeDragging}
      onPaneClick={onPaneClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      isDraggingEdge={isDraggingEdge}
      onDrop={canEdit ? handleNoteDrop : () => {}}
      onBoxSelect={canEdit ? handleBoxSelect : undefined}
      onAddNoteToGraph={canEdit ? handleAddNoteToGraph : () => {}}
      screenToFlowPosition={screenToFlowPosition}
      isMain={isMain}
      graphHistory={graphHistory}
      canEdit={canEdit}
    />
  );
});
