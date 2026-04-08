import { useIsMobile } from '@/shared/lib/react/hooks';
import { memo } from 'react';
import ReactFlow from 'reactflow';
import {
  useGraphContextActions,
  useGraphContextState,
} from '../../lib/context';
import { GraphBackground } from './GraphBackground';
import { GraphControls } from './GraphControls';
import { GraphMiniMap } from './GraphMiniMap';
import { useGraphViewContext } from './GraphViewContext';
import { MultiColorEdge } from './multi-color-edge';
import { NoteNodeComponent } from './NoteNode';
import { OffscreenArrows } from './OffscreenArrows';

const edgeTypes = {
  multiColor: MultiColorEdge,
};

const nodeTypes = {
  note: NoteNodeComponent,
};

export const GraphReactFlowCore = memo(function GraphReactFlowCore() {
  const isMobile = useIsMobile();
  const {
    onNodeDragStop,
    onNodeDrag,
    onNodeContextMenu,
    onPaneClick: onPaneClickProp,
    ViewportTracker,
    onViewportChange,
    minimapOffset: _minimapOffset = '0px',
  } = useGraphViewContext();
  const {
    layoutId,
    nodesWithSelection,
    edgesWithSelection,
    disableZoomDuringDrag,
    allowNodeDrag,
    canEdit,
    isMain,
    graphHistory,
  } = useGraphContextState();
  const {
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onNodeDragStart,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPaneClick,
    onNodeDoubleClick,
  } = useGraphContextActions();

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
      onPaneClick={onPaneClickProp ?? onPaneClick}
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
