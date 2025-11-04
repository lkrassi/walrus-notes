import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Note } from 'shared/model/types/layouts';
import {
  useCreateNoteLinkMutation,
  useDeleteNoteLinkMutation,
} from 'widgets/model/stores/api';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphEffects } from '../../model/hooks/useGraphEffects';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { GraphBackground } from './GraphBackground';
import { GraphContainer } from './GraphContainer';
import { GraphControls } from './GraphControls';
import { GraphDropZone } from './GraphDropZone';
import { GraphMiniMap } from './GraphMiniMap';
import { MultiColorEdge } from './MultiColorEdge';
import { NoteNodeComponent } from './NoteNode';
import { UnposedNotesList } from './UnposedNotesList';

interface EdgeDeleteEventDetail {
  edgeId: string;
  source: string;
  target: string;
  newTarget?: string | null;
}

declare global {
  interface DocumentEventMap {
    edgeDeleteDrop: CustomEvent<EdgeDeleteEventDetail>;
    edgeDeleteStart: CustomEvent<EdgeDeleteEventDetail>;
  }
}

interface NotesGraphContentProps {
  layoutId: string;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
}

const edgeTypes = {
  multiColor: MultiColorEdge,
};

const nodeTypes = {
  note: NoteNodeComponent,
};

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
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdgesState, onEdgesChange] = useEdgesState(initialEdges);
    const [deleteNoteLink] = useDeleteNoteLinkMutation();
    const [createNoteLink] = useCreateNoteLinkMutation();
    const [isDraggingEdge, setIsDraggingEdge] = useState(false);

    const isProcessingRef = useRef(false);

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

    useGraphEffects({
      initialNodes,
      initialEdges,
      tempEdges,
      selectedNodeId,
      hoveredNodeId,
      setNodes,
      setEdges: setEdgesState,
      setTempEdges,
    });

    useEffect(() => {
      const handleEdgeDeleteDrop = async (
        event: CustomEvent<EdgeDeleteEventDetail>
      ) => {
        const { edgeId, source, target, newTarget } = event.detail;

        if (isProcessingRef.current) {
          return;
        }

        isProcessingRef.current = true;

        setIsDraggingEdge(false);

        try {
          const currentEdges = getEdges();

          if (newTarget) {
            const connectionExists = currentEdges.some(
              edge => edge.source === source && edge.target === newTarget
            );

            if (connectionExists) {
              isProcessingRef.current = false;
              return;
            }

            await deleteNoteLink({
              layoutId,
              firstNoteId: source,
              secondNoteId: target,
            }).unwrap();

            await createNoteLink({
              layoutId,
              firstNoteId: source,
              secondNoteId: newTarget,
            }).unwrap();

            setEdgesState(eds => {
              const filteredEdges = eds.filter(edge => {
                const shouldRemove = edge.id !== edgeId;
                return shouldRemove;
              });

              const edgesWithoutNewTarget = filteredEdges.filter(
                edge => !(edge.source === source && edge.target === newTarget)
              );

              const newEdgeId = `edge-${source}-${newTarget}`;
              const newEdge = {
                id: newEdgeId,
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

              const result = [...edgesWithoutNewTarget, newEdge];

              return result;
            });
          } else {
            await deleteNoteLink({
              layoutId,
              firstNoteId: source,
              secondNoteId: target,
            }).unwrap();

            setEdgesState(eds => {
              const result = eds.filter(edge => {
                const shouldRemove = edge.id !== edgeId;
                return shouldRemove;
              });

              return result;
            });
          }
        } catch (error) {
          console.error(error);
        } finally {
          isProcessingRef.current = false;
        }
      };

      const handleEdgeDeleteStart = (
        event: CustomEvent<EdgeDeleteEventDetail>
      ) => {
        setIsDraggingEdge(true);
      };

      const dropEventHandler = (event: Event) => {
        handleEdgeDeleteDrop(event as CustomEvent<EdgeDeleteEventDetail>);
      };

      const startEventHandler = (event: Event) => {
        handleEdgeDeleteStart(event as CustomEvent<EdgeDeleteEventDetail>);
      };

      document.addEventListener('edgeDeleteDrop', dropEventHandler);
      document.addEventListener('edgeDeleteStart', startEventHandler);

      return () => {
        document.removeEventListener('edgeDeleteDrop', dropEventHandler);
        document.removeEventListener('edgeDeleteStart', startEventHandler);
        // Сбрасываем флаг при размонтировании
        isProcessingRef.current = false;
      };
    }, [layoutId, deleteNoteLink, createNoteLink, setEdgesState, getEdges]);

    const handleNoteOpen = useCallback(
      (noteId: string) => {
        const node = nodes.find(n => n.id === noteId);
        if (node && node.data.note) {
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

    // Обработчик дропа для заметок
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
            console.error(error);
          }
        }
      },
      [handleAddNoteToGraph, screenToFlowPosition]
    );

    return (
      <GraphContainer>
        <GraphDropZone onDrop={handleNoteDrop} isDraggingEdge={isDraggingEdge}>
          <ReactFlow
            nodes={nodesWithSelection}
            edges={edgesWithSelection}
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
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition='bottom-left'
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            key={layoutId}
            onNodeDoubleClick={handleNodeDoubleClick}
          >
            <GraphBackground />
            <GraphControls />
            <GraphMiniMap />

            <UnposedNotesList
              layoutId={layoutId}
              onNoteSelect={handleAddNoteToGraph}
            />
          </ReactFlow>
        </GraphDropZone>
      </GraphContainer>
    );
  }
);
