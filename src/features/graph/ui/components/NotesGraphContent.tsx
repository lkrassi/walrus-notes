import { memo, useCallback, useEffect, useState } from 'react';
import {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from 'reactflow';
import type { Note } from 'shared/model/types/layouts';
import { useGraphConnectionHandlers } from '../../model/hooks/useGraphConnectionHandlers';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphDragHandlers } from '../../model/hooks/useGraphDragHandlers';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useGraphHistory } from '../../model/hooks/useGraphHistory';
import { useGraphInitialization } from '../../model/hooks/useGraphInitialization';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useGraphSelectionHandlers } from '../../model/hooks/useGraphSelectionHandlers';
import { useGraphSyncHandlers } from '../../model/hooks/useGraphSyncHandlers';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { NotesGraphView } from './NotesGraphView';
import { useEdgeDeleteEvents } from './useEdgeDeleteEvents';

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
    (e: React.MouseEvent, node: Node) => {
      if (isNodeDraggingRef.current) return;
      handleNodeMouseEnter(e, node);
    },
    [handleNodeMouseEnter, isNodeDraggingRef]
  );

  const handleNodeMouseLeaveWrapped = useCallback(
    (e: React.MouseEvent, node: Node) => {
      if (isNodeDraggingRef.current) return;
      handleNodeMouseLeave(e, node);
    },
    [handleNodeMouseLeave, isNodeDraggingRef]
  );

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
      onNodesChange={_handleNodesChange}
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
