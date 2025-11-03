import React, { useCallback } from 'react';
import ReactFlow, {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Note } from 'shared/model/types/layouts';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphEffects } from '../../model/hooks/useGraphEffects';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { GraphBackground } from './GraphBackground';
import { GraphContainer } from './GraphContainer';
import { GraphControls } from './GraphControls';
import { GraphDropZone } from './GraphDropZone';
import { GraphLoading } from './GraphLoading';
import { GraphMiniMap } from './GraphMiniMap';
import { MultiColorEdge } from './MultiColorEdge';
import { NoteNodeComponent } from './NoteNode';
import { UnposedNotesList } from './UnposedNotesList';

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
      isLoading,
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

    const { screenToFlowPosition } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      setEdges,
      setTempEdges,
    });

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
      onDrop: onNoteDrop,
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

    const handleDrop = useCallback(
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

    if (isLoading) {
      return <GraphLoading />;
    }

    return (
      <GraphContainer>
        <GraphDropZone onDrop={handleDrop}>
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
