import React, { useCallback, useState, useEffect, useRef } from 'react';
import type { Edge, Node, ReactFlowProps } from 'reactflow';
import ReactFlow, { useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import type { Note } from 'shared/model/types/layouts';
import type { UseGraphHistoryReturn } from '../../model/hooks/useGraphHistory';
import { useIsMobile } from 'widgets/hooks';
import { useDndSensors } from 'shared/lib/useDndSensors';
import { GraphBackground } from './GraphBackground';
import { GraphContainer } from './GraphContainer';
import { GraphControls } from './GraphControls';
import { GraphDropZone } from './GraphDropZone';
import { GraphMiniMap } from './GraphMiniMap';
import { MultiColorEdge } from './MultiColorEdge';
import { NoteNodeComponent } from './NoteNode';
import { UnposedNotesList } from './UnposedNotesList';
import CoordinateOverlay from './CoordinateOverlay';
import OffscreenArrows from './OffscreenArrows';
import { TouchEnabledGraph } from './TouchEnabledGraph';

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
  onNodeDragStop?: (
    event: React.MouseEvent,
    node: Node,
    nodes?: Node[]
  ) => void;
  onNodeDragStart?: ReactFlowProps['onNodeDragStart'];
  onNodeClick: ReactFlowProps['onNodeClick'];
  onNodeMouseEnter: ReactFlowProps['onNodeMouseEnter'];
  onNodeMouseLeave: ReactFlowProps['onNodeMouseLeave'];
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  isDraggingEdge: boolean;
  onDrop: (event: React.DragEvent) => void;
  onAddNoteToGraph: (note: Note, position?: { x: number; y: number }) => void;
  screenToFlowPosition?: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  onBoxSelect?: (rect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }) => void;
  disableZoomDuringDrag?: boolean;
  allowNodeDrag?: boolean;
  isMain?: boolean;
  graphHistory?: UseGraphHistoryReturn;
}

export const NotesGraphView: React.FC<NotesGraphViewProps> = ({
  layoutId,
  screenToFlowPosition,
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
  onNodeDragStart,
  disableZoomDuringDrag,
  allowNodeDrag,
  onPaneClick,
  onNodeDoubleClick,
  isDraggingEdge,
  onDrop,
  onAddNoteToGraph,
  onBoxSelect,
  isMain,
  graphHistory,
}: NotesGraphViewProps) => {
  const cleanupRef = useRef<(() => void) | null>(null);
  const [overlayCoords, setOverlayCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [centerCoords, setCenterCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [activeDragNote, setActiveDragNote] = useState<Note | null>(null);
  const [lastClientCoords, setLastClientCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const isMobile = useIsMobile();

  const handleNodeDrag = useCallback((_event: React.MouseEvent, node: Node) => {
    setOverlayCoords({ x: node.position.x, y: node.position.y });
  }, []);

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setOverlayCoords(null);
      onNodeDragStop?.(event, node, nodesWithSelection as Node[]);
    },
    [onNodeDragStop, nodesWithSelection]
  );

  const ViewportTracker: React.FC<{
    onViewportChange: (c: { x: number; y: number } | null) => void;
  }> = ({ onViewportChange }) => {
    const { getViewport } = useReactFlow();

    useEffect(() => {
      let mounted = true;

      const tick = () => {
        if (!mounted) return;
        try {
          const vp = getViewport();
          const wrapper = document.querySelector(
            '.react-flow'
          ) as HTMLElement | null;
          if (!wrapper || !vp) {
            onViewportChange(null);
          } else {
            const width = wrapper.clientWidth;
            const height = wrapper.clientHeight;
            const zoom = vp.zoom ?? 1;
            const cx = (width / 2 - (vp.x ?? 0)) / zoom;
            const cy = (height / 2 - (vp.y ?? 0)) / zoom;
            onViewportChange({ x: cx, y: cy });
          }
        } catch (_e) {
          onViewportChange(null);
        }
        requestAnimationFrame(tick);
      };

      const id = requestAnimationFrame(tick);
      return () => {
        mounted = false;
        cancelAnimationFrame(id);
      };
    }, [getViewport, onViewportChange]);

    return null;
  };
  const handleTouchNodePositionChange = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      const node = nodesWithSelection.find(n => n.id === nodeId);
      if (!node || !onNodeDragStop) return;

      const updatedNode = { ...node, position };
      onNodeDragStop({} as React.MouseEvent, updatedNode, [updatedNode]);
    },
    [nodesWithSelection, onNodeDragStop]
  );

  const handleDndDragStart = useCallback((event: DragStartEvent) => {
    const note = event.active.data.current as Note | undefined;
    if (note) {
      setActiveDragNote(note);
    }
    const handlePointer = (e: PointerEvent) => {
      setLastClientCoords({ x: e.clientX, y: e.clientY });
    };
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches && e.touches[0];
      if (t) setLastClientCoords({ x: t.clientX, y: t.clientY });
    };
    window.addEventListener('pointermove', handlePointer);
    window.addEventListener('touchmove', handleTouch);
    cleanupRef.current = () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  const handleDndDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const id = active.id.toString();

      if (id.startsWith('unposed-') && over?.id === 'graph-drop-zone') {
        const note = active.data.current as Note | undefined;
        if (note) {
          let dropPosition = centerCoords || { x: 0, y: 0 };
          const client = lastClientCoords;
          if (client && typeof screenToFlowPosition === 'function') {
            try {
              dropPosition = screenToFlowPosition(client);
            } catch (_e) {}
          }
          onAddNoteToGraph(note, dropPosition);
        }
      }

      setActiveDragNote(null);
      try {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      } catch (_e) {}
      setLastClientCoords(null);
    },
    [onAddNoteToGraph, centerCoords, lastClientCoords, screenToFlowPosition]
  );

  return (
    <GraphContainer>
      <DndContext
        sensors={useDndSensors({
          mouseDistance: 5,
          touchDelay: 100,
          touchTolerance: 5,
        })}
        onDragStart={handleDndDragStart}
        onDragEnd={handleDndDragEnd}
      >
        <GraphDropZone
          onDrop={onDrop}
          isDraggingEdge={isDraggingEdge}
          onBoxSelect={onBoxSelect}
        >
          <TouchEnabledGraph
            nodes={nodesWithSelection}
            onNodePositionChange={handleTouchNodePositionChange}
            disabled={!isMobile}
          >
            <div className='relative h-full w-full'>
              <ReactFlow
                nodes={nodesWithSelection}
                edges={edgesWithSelection}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={handleNodeDragStop}
                onNodeDrag={handleNodeDrag}
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
                <ViewportTracker onViewportChange={v => setCenterCoords(v)} />
              </ReactFlow>
              <CoordinateOverlay
                coords={overlayCoords}
                centerCoords={centerCoords}
              />
            </div>
          </TouchEnabledGraph>
        </GraphDropZone>
        <UnposedNotesList layoutId={layoutId} onNoteSelect={onAddNoteToGraph} />
        <DragOverlay>
          {activeDragNote && (
            <div className='dark:bg-dark-bg border-primary dark:border-primary-dark max-w-xs rounded-lg border bg-white p-3 shadow-lg'>
              <h4 className='text-text dark:text-dark-text truncate text-sm font-medium'>
                {activeDragNote.title}
              </h4>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </GraphContainer>
  );
};

export default NotesGraphView;
