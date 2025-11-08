import React from 'react';
import type { Edge, Node, ReactFlowProps } from 'reactflow';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import type { Note } from 'shared/model/types/layouts';
import { GraphBackground } from './GraphBackground';
import { GraphContainer } from './GraphContainer';
import { GraphControls } from './GraphControls';
import { GraphDropZone } from './GraphDropZone';
import { GraphMiniMap } from './GraphMiniMap';
import { MultiColorEdge } from './MultiColorEdge';
import { NoteNodeComponent } from './NoteNode';
import { UnposedNotesList } from './UnposedNotesList';

const edgeTypes = {
  multiColor: MultiColorEdge,
};

const nodeTypes = {
  note: NoteNodeComponent,
};

interface NotesGraphViewProps {
  layoutId: string;
  nodes: Node[];
  edges: Edge[];
  nodesWithSelection: Node[];
  edgesWithSelection: Edge[];
  onNodesChange: ReactFlowProps['onNodesChange'];
  onEdgesChange: ReactFlowProps['onEdgesChange'];
  onConnect: ReactFlowProps['onConnect'];
  onConnectStart: ReactFlowProps['onConnectStart'];
  onConnectEnd: ReactFlowProps['onConnectEnd'];
  onNodeDragStop: ReactFlowProps['onNodeDragStop'];
  onNodeClick: ReactFlowProps['onNodeClick'];
  onNodeMouseEnter: ReactFlowProps['onNodeMouseEnter'];
  onNodeMouseLeave: ReactFlowProps['onNodeMouseLeave'];
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  isDraggingEdge: boolean;
  onDrop: (event: React.DragEvent) => void;
  onAddNoteToGraph: (note: Note, position?: { x: number; y: number }) => void;
  onBoxSelect?: (rect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }) => void;
}

export const NotesGraphView: React.FC<NotesGraphViewProps> = ({
  layoutId,
  nodesWithSelection,
  edgesWithSelection,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeDragStop,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneClick,
  onNodeDoubleClick,
  isDraggingEdge,
  onDrop,
  onAddNoteToGraph,
  onBoxSelect,
}: NotesGraphViewProps) => {
  return (
    <GraphContainer>
      <GraphDropZone
        onDrop={onDrop}
        isDraggingEdge={isDraggingEdge}
        onBoxSelect={onBoxSelect}
      >
        <ReactFlow
          nodes={nodesWithSelection}
          edges={edgesWithSelection}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
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
          onNodeDoubleClick={onNodeDoubleClick}
          key={layoutId}
        >
          <GraphBackground />
          <GraphControls />
          <GraphMiniMap />
          <UnposedNotesList
            layoutId={layoutId}
            onNoteSelect={onAddNoteToGraph}
          />
        </ReactFlow>
      </GraphDropZone>
    </GraphContainer>
  );
};

export default NotesGraphView;
