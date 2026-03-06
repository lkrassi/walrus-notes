import type { UseGraphHistoryReturn } from '@/entities/graph/model';
import { useIsMobile } from '@/shared/lib/hooks';
import { memo, type FC, type MouseEvent } from 'react';
import type { Edge, Node, ReactFlowProps } from 'reactflow';
import ReactFlow from 'reactflow';
import { GraphBackground } from './GraphBackground';
import { GraphControls } from './GraphControls';
import { GraphMiniMap } from './GraphMiniMap';
import { MultiColorEdge } from './multi-color-edge';
import { NoteNodeComponent } from './NoteNode';
import { OffscreenArrows } from './OffscreenArrows';

const edgeTypes = {
  multiColor: MultiColorEdge,
};

const nodeTypes = {
  note: NoteNodeComponent,
};

interface GraphReactFlowCoreProps {
  layoutId: string;
  nodesWithSelection: Node[];
  edgesWithSelection: Edge[];
  onNodesChange: ReactFlowProps['onNodesChange'];
  onEdgesChange: ReactFlowProps['onEdgesChange'];
  onConnect: ReactFlowProps['onConnect'];
  onConnectStart: ReactFlowProps['onConnectStart'];
  onConnectEnd: ReactFlowProps['onConnectEnd'];
  onNodeDragStart?: ReactFlowProps['onNodeDragStart'];
  onNodeDragStop: (event: MouseEvent, node: Node) => void;
  onNodeDrag: (event: MouseEvent, node: Node) => void;
  onNodeClick: ReactFlowProps['onNodeClick'];
  onNodeMouseEnter: ReactFlowProps['onNodeMouseEnter'];
  onNodeMouseLeave: ReactFlowProps['onNodeMouseLeave'];
  onPaneClick: (event: MouseEvent) => void;
  onNodeDoubleClick: (event: MouseEvent, node: Node) => void;
  disableZoomDuringDrag?: boolean;
  allowNodeDrag?: boolean;
  isMain?: boolean;
  graphHistory?: UseGraphHistoryReturn;
  ViewportTracker: FC<{
    onViewportChange: (c: { x: number; y: number } | null) => void;
  }>;
  onViewportChange: (c: { x: number; y: number } | null) => void;
}

export const GraphReactFlowCore = memo(function GraphReactFlowCore({
  layoutId,
  nodesWithSelection,
  edgesWithSelection,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeDragStart,
  onNodeDragStop,
  onNodeDrag,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneClick,
  onNodeDoubleClick,
  disableZoomDuringDrag,
  allowNodeDrag,
  isMain,
  graphHistory,
  ViewportTracker,
  onViewportChange,
}: GraphReactFlowCoreProps) {
  const isMobile = useIsMobile();

  return (
    <ReactFlow
      nodes={nodesWithSelection}
      edges={edgesWithSelection}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onNodeDrag={onNodeDrag}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      attributionPosition='bottom-left'
      nodesDraggable={allowNodeDrag !== false}
      nodesConnectable={true}
      elementsSelectable={true}
      selectNodesOnDrag={false}
      minZoom={0.1}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      onNodeDoubleClick={onNodeDoubleClick}
      zoomOnScroll={!disableZoomDuringDrag}
      zoomOnPinch={!disableZoomDuringDrag}
      connectionRadius={isMobile ? 30 : 20}
      key={layoutId}
    >
      <GraphBackground />
      <GraphControls graphHistory={graphHistory} />
      <GraphMiniMap />
      <OffscreenArrows nodes={nodesWithSelection} isMain={isMain} />
      <ViewportTracker onViewportChange={onViewportChange} />
    </ReactFlow>
  );
});
