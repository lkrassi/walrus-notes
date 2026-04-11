import { useIsMobile } from '@/shared/lib/react/hooks';
import { memo, useEffect, useRef } from 'react';
import ReactFlow, { useReactFlow } from 'reactflow';
import {
  useGraphContextActions,
  useGraphContextState,
} from '../../lib/context';
import { GraphBackground } from './GraphBackground';
import { GraphConnectionLine } from './GraphConnectionLine';
import { GraphControls } from './GraphControls';
import { GraphMiniMap } from './GraphMiniMap';
import { GraphRetractLine } from './GraphRetractLine';
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
  const { fitView, setViewport } = useReactFlow();
  const pendingFitLayoutIdRef = useRef<string | null>(null);
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
    isRefreshing,
    nodesWithSelection,
    edgesWithSelection,
    disableZoomDuringDrag,
    allowNodeDrag,
    canEdit,
    retractLine,
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

  useEffect(() => {
    pendingFitLayoutIdRef.current = layoutId;
  }, [layoutId]);

  useEffect(() => {
    if (pendingFitLayoutIdRef.current !== layoutId) {
      return;
    }

    if (isRefreshing) {
      return;
    }

    const hasForeignNodes =
      !isMain &&
      nodesWithSelection.some(node => {
        const nodeLayoutId = (
          node.data as { note?: { layoutId?: string } } | undefined
        )?.note?.layoutId;

        return (
          typeof nodeLayoutId === 'string' &&
          nodeLayoutId.length > 0 &&
          nodeLayoutId !== layoutId
        );
      });

    if (hasForeignNodes) {
      return;
    }

    if (nodesWithSelection.length === 0 && edgesWithSelection.length === 0) {
      void setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
      pendingFitLayoutIdRef.current = null;
      return;
    }

    const fitOptions = { padding: 0.22, duration: 500 };
    let rafId2: number | null = null;
    const rafId = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        void fitView(fitOptions);
        pendingFitLayoutIdRef.current = null;
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (rafId2 !== null) {
        cancelAnimationFrame(rafId2);
      }
    };
  }, [
    fitView,
    setViewport,
    isRefreshing,
    isMain,
    layoutId,
    nodesWithSelection,
    edgesWithSelection.length,
  ]);

  return (
    <ReactFlow
      nodes={nodesWithSelection}
      edges={edgesWithSelection}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={canEdit ? onConnect : undefined}
      onConnectStart={canEdit ? onConnectStart : undefined}
      onConnectEnd={canEdit ? onConnectEnd : undefined}
      connectionLineComponent={GraphConnectionLine}
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
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
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
      {retractLine && (
        <GraphRetractLine key={retractLine.id} line={retractLine} />
      )}
      <OffscreenArrows nodes={nodesWithSelection} isMain={isMain} />
      <ViewportTracker onViewportChange={onViewportChange} />
    </ReactFlow>
  );
});
