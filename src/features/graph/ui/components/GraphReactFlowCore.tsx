import type { UseGraphHistoryReturn } from '@/entities/graph';
import { useIsMobile } from '@/shared/lib/react/hooks';
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
  onNodeContextMenu?: ReactFlowProps['onNodeContextMenu'];
  onPaneClick: (event: MouseEvent) => void;
  onNodeDoubleClick: (event: MouseEvent, node: Node) => void;
  disableZoomDuringDrag?: boolean;
  allowNodeDrag?: boolean;
  canEdit?: boolean;
  isMain?: boolean;
  graphHistory?: UseGraphHistoryReturn;
  ViewportTracker: FC<{
    onViewportChange: (c: { x: number; y: number } | null) => void;
  }>;
  onViewportChange: (c: { x: number; y: number } | null) => void;
  minimapOffset?: string;
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
  onNodeContextMenu,
  onPaneClick,
  onNodeDoubleClick,
  disableZoomDuringDrag,
  allowNodeDrag,
  canEdit = true,
  isMain,
  graphHistory,
  ViewportTracker,
  onViewportChange,
  minimapOffset: _minimapOffset = '0px',
}: GraphReactFlowCoreProps) {
  const isMobile = useIsMobile();

  return (
    <ReactFlow
      nodes={nodesWithSelection}
      edges={edgesWithSelection}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={canEdit ? onConnect : undefined}
      onConnectStart={canEdit ? onConnectStart : undefined}
      onConnectEnd={canEdit ? onConnectEnd : undefined}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onNodeDrag={onNodeDrag}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onNodeContextMenu={onNodeContextMenu}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.22, duration: 500 }}
      attributionPosition='bottom-left'
      nodesDraggable={canEdit && allowNodeDrag !== false}
      nodesConnectable={canEdit}
      elementsSelectable={canEdit}
      selectNodesOnDrag={false}
      minZoom={0.1}
      maxZoom={2.3}
      proOptions={{ hideAttribution: true }}
      onNodeDoubleClick={onNodeDoubleClick}
      zoomOnScroll={!disableZoomDuringDrag}
      zoomOnPinch={!disableZoomDuringDrag}
      panOnScroll={false}
      panOnDrag
      elevateEdgesOnSelect
      connectionRadius={isMobile ? 30 : 20}
      key={layoutId}
    >
      <GraphBackground />
      <GraphMiniMap rightOffset={_minimapOffset} />
      <GraphControls graphHistory={graphHistory} />
      <OffscreenArrows nodes={nodesWithSelection} isMain={isMain} />
      <ViewportTracker onViewportChange={onViewportChange} />
    </ReactFlow>
  );
});
