import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import type { Note } from '@/shared/model';
import { memo } from 'react';
import { useGraphContentHandlers, useGraphState } from '../../lib/hooks';
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
      allowNodeDrag={allowNodeDrag}
      nodes={nodes}
      edges={edges}
      nodesWithSelection={nodesWithSelection}
      edgesWithSelection={edgesWithSelection}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodeDragStart={handleNodeDragStart}
      onNodeDragStop={handleNodeDragStop}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnterWrapped}
      onNodeMouseLeave={handleNodeMouseLeaveWrapped}
      disableZoomDuringDrag={isNodeDragging}
      onPaneClick={onPaneClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      isDraggingEdge={isDraggingEdge}
      onDrop={handleNoteDrop}
      onBoxSelect={handleBoxSelect}
      onAddNoteToGraph={handleAddNoteToGraph}
      screenToFlowPosition={screenToFlowPosition}
      isMain={isMain}
      graphHistory={graphHistory}
    />
  );
});
