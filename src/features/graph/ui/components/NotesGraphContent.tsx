import React from 'react';
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
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import { GraphBackground } from './GraphBackground';
import { GraphControls } from './GraphControls';
import { GraphLoading } from './GraphLoading';
import { GraphMiniMap } from './GraphMiniMap';
import { MultiColorEdge } from './MultiColorEdge';
import { NoteNodeComponent } from './NoteNode';
import { UnposedNotesList } from './UnposedNotesList';

interface NotesGraphContentProps {
  layoutId: string;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
}

// ✅ ИСПРАВЛЕНО: Мемоизация вынесена за пределы компонента
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

    const edgesWithSelection = (() => {
      const combinedEdges = [...edges, ...tempEdges];

      if (!selectedNodeId) {
        return combinedEdges.map(edge => ({
          ...edge,
          style: {
            strokeWidth: 2,
            strokeDasharray: '5,5',
            opacity: 0.3,
          },
          data: {
            ...edge.data,
            isRelatedToSelected: false,
            isSelected: false,
          },
        }));
      }

      return combinedEdges.map(edge => {
        const isRelated =
          selectedNodeId === edge.source || selectedNodeId === edge.target;
        return {
          ...edge,
          style: {
            strokeWidth: isRelated ? 3 : 2,
            strokeDasharray: isRelated ? '0' : '5,5',
            opacity: isRelated ? 1 : 0.3,
          },
          data: {
            ...edge.data,
            isRelatedToSelected: isRelated,
            isSelected: isRelated,
          },
        };
      });
    })();

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

    const handleNoteOpen = (noteId: string) => {
      const node = nodes.find(n => n.id === noteId);
      if (node && node.data.note) {
        onNoteOpen?.({ noteId, note: node.data.note });
      }
    };

    const nodesWithSelection = (() => {
      if (!selectedNodeId) {
        return nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            selected: false,
            isRelatedToSelected: true,
            onNoteClick: handleNoteOpen,
          },
          style: {
            ...node.style,
            opacity: 1,
          },
        }));
      }

      const relatedNodeIds = new Set<string>([selectedNodeId]);
      allEdges.forEach(edge => {
        if (edge.source === selectedNodeId) relatedNodeIds.add(edge.target);
        if (edge.target === selectedNodeId) relatedNodeIds.add(edge.source);
      });

      return nodes.map(node => {
        const isRelated = relatedNodeIds.has(node.id);
        const isSelected = selectedNodeId === node.id;

        return {
          ...node,
          data: {
            ...node.data,
            selected: isSelected,
            isRelatedToSelected: isRelated,
            onNoteClick: handleNoteOpen,
          },
          style: {
            ...node.style,
            opacity: isRelated ? 1 : 0.5,
            transition: 'opacity 0.3s ease-in-out',
          },
        };
      });
    })();

    const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      node.data?.onNoteClick?.(node.id);
    };

    if (isLoading) {
      return <GraphLoading />;
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
        </div>
      </div>
    );
  }
);
