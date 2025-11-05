import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from 'reactflow';
import type { Note } from 'shared/model/types/layouts';
import {
  useCreateNoteLinkMutation,
  useDeleteNoteLinkMutation,
} from 'widgets/model/stores/api';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import NotesGraphView from './NotesGraphView';
import { useEdgeDeleteEvents } from './useEdgeDeleteEvents';

interface NotesGraphContentProps {
  layoutId: string;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
}

export const NotesGraphContent = React.memo(
  ({ layoutId, onNoteOpen }: NotesGraphContentProps) => {
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

    const { screenToFlowPosition, getEdges } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
    const [deleteNoteLink] = useDeleteNoteLinkMutation();
    const [createNoteLink] = useCreateNoteLinkMutation();
    const [isDraggingEdge, setIsDraggingEdge] = useState(false);

    const isProcessingRef = useRef(false);
    const prevLayoutIdRef = useRef(layoutId);

    useEffect(() => {
      if (prevLayoutIdRef.current !== layoutId) {
        setNodes(initialNodes);
        setEdgesState(initialEdges);
        prevLayoutIdRef.current = layoutId;
      } else {
        setNodes(initialNodes);
        setEdgesState(initialEdges);
      }
    }, [initialNodes, initialEdges, layoutId, setNodes, setEdgesState]);

    const {
      tempEdges,
      allEdges,
      onConnectStart,
      onConnectEnd,
      onConnect,
      setTempEdges,
    } = useGraphConnections({
      layoutId,
      nodes,
      edges,
      selectedNodeId,
      hoveredNodeId,
      screenToFlowPosition,
    });

    useEffect(() => {
      if (tempEdges.length > 0) {
        setTempEdges(prev =>
          prev.filter(tempEdge => !edges.some(edge => edge.id === tempEdge.id))
        );
      }
    }, [edges, tempEdges.length, setTempEdges]);

    const handleEdgeDeleteDrop = useCallback(
      async (
        event: CustomEvent<{
          edgeId: string;
          source: string;
          target: string;
          newTarget?: string | null;
        }>
      ) => {
        const { edgeId, source, target, newTarget } = event.detail;

        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        setIsDraggingEdge(false);

        try {
          const currentEdges = getEdges();

          if (newTarget) {
            const connectionExists = currentEdges.some(
              edge => edge.source === source && edge.target === newTarget
            );

            if (connectionExists) return;

            await deleteNoteLink({
              layoutId,
              firstNoteId: source,
              secondNoteId: target,
            });
            await createNoteLink({
              layoutId,
              firstNoteId: source,
              secondNoteId: newTarget,
            });

            setEdgesState(eds => {
              const filteredEdges = eds.filter(edge => edge.id !== edgeId);
              const edgesWithoutNewTarget = filteredEdges.filter(
                edge => !(edge.source === source && edge.target === newTarget)
              );

              const newEdge = {
                id: `edge-${source}-${newTarget}`,
                source,
                target: newTarget,
                type: 'multiColor' as const,
                data: {
                  sourceColor:
                    eds.find(e => e.source === source)?.data?.sourceColor ||
                    '#6b7280',
                  targetColor:
                    eds.find(e => e.target === newTarget)?.data?.targetColor ||
                    '#6b7280',
                },
              };

              return [...edgesWithoutNewTarget, newEdge];
            });
          } else {
            await deleteNoteLink({
              layoutId,
              firstNoteId: source,
              secondNoteId: target,
            });
            setEdgesState(eds => eds.filter(edge => edge.id !== edgeId));
          }
        } catch (error) {
          console.error('Error handling edge delete drop:', error);
        } finally {
          isProcessingRef.current = false;
        }
      },
      [layoutId, deleteNoteLink, createNoteLink, setEdgesState, getEdges]
    );

    const handleEdgeDeleteStart = useCallback(() => {
      setIsDraggingEdge(true);
    }, []);

    useEdgeDeleteEvents(handleEdgeDeleteDrop, handleEdgeDeleteStart);

    const handleNoteOpen = useCallback(
      (noteId: string) => {
        const node = nodes.find(n => n.id === noteId);
        if (node?.data?.note) {
          onNoteOpen?.({ noteId, note: node.data.note });
        }
      },
      [nodes, onNoteOpen]
    );

    const { edgesWithSelection, nodesWithSelection } = useGraphSelection({
      nodes,
      edges,
      tempEdges,
      selectedNodeId,
      allEdges,
      onNoteOpen: handleNoteOpen,
    });

    const {
      handleAddNoteToGraph,
      onNodeDragStop,
      handleNodesChange,
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

    const handleNodeDoubleClick = useCallback(
      (event: React.MouseEvent, node: Node) => {
        event.stopPropagation();
        node.data?.onNoteClick?.(node.id);
      },
      []
    );

    const handleNoteDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
        const noteData = event.dataTransfer.getData('application/reactflow');
        if (noteData) {
          try {
            const note = JSON.parse(noteData);
            const dropPosition = screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });
            handleAddNoteToGraph(note, dropPosition);
          } catch (error) {
            console.error('Error handling note drop:', error);
          }
        }
      },
      [handleAddNoteToGraph, screenToFlowPosition]
    );

    return (
      <NotesGraphView
        layoutId={layoutId}
        nodes={nodes}
        edges={edges}
        nodesWithSelection={nodesWithSelection}
        edgesWithSelection={edgesWithSelection}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        isDraggingEdge={isDraggingEdge}
        onDrop={handleNoteDrop}
        onAddNoteToGraph={handleAddNoteToGraph}
      />
    );
  }
);

export default NotesGraphContent;
