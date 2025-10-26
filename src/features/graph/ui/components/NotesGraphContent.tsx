import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Note } from 'shared/model';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphEffects } from '../../model/hooks/useGraphEffects';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { MultiColorEdge } from './MultiColorEdge';
import { generateColorFromId, NoteNodeComponent } from './NoteNode';
import { UnposedNotesList } from './UnposedNotesList';

interface NotesGraphContentProps {
  layoutId: string;
  onNoteDoubleClick?: (note: Note) => void;
}

const edgeTypes = {
  multiColor: MultiColorEdge,
};

const nodeTypes = {
  note: NoteNodeComponent,
};

export const NotesGraphContent = React.memo(
  ({ layoutId, onNoteDoubleClick }: NotesGraphContentProps) => {
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

    const {
      handleAddNoteToGraph,
      onNodeDragStop,
      handleNodesChange,
      handleNodeClick,
      handleNodeMouseEnter,
      handleNodeMouseLeave,
      onDrop,
    } = useGraphHandlers({
      updatePositionCallback,
      onNodeClick,
      onNodeMouseEnter,
      onNodeMouseLeave,
      onNodesChange,
      screenToFlowPosition,
    });

    // Обновляем nodes с учетом выбранного состояния
    const nodesWithSelection = useMemo(
      () =>
        nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            selected: selectedNodeId === node.id,
          },
        })),
      [nodes, selectedNodeId]
    );

    if (isLoading) {
      return (
        <div className='flex h-full items-center justify-center'>
          <div className='text-text-secondary dark:text-dark-text-secondary'>
            Загрузка графа...
          </div>
        </div>
      );
    }

    return (
      <div className='bg-bg dark:bg-dark-bg relative flex h-full w-full'>
        <div
          className='flex-1'
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          <ReactFlow
            nodes={nodesWithSelection}
            edges={allEdges}
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
          >
            <Background gap={20} size={1} color='#6b7280' />
            <Controls />
            <MiniMap
              nodeColor={node => generateColorFromId(node.id)}
              maskColor='rgba(0, 0, 0, 0.1)'
            />

            <UnposedNotesList
              layoutId={layoutId}
              onNoteSelect={handleAddNoteToGraph}
            />
          </ReactFlow>
        </div>
      </div>
    );
  }
);
