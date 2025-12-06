import React, { useCallback, useState, useEffect } from 'react';
import type { Edge, Node, ReactFlowProps } from 'reactflow';
import ReactFlow, { useReactFlow } from 'reactflow';
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
import CoordinateOverlay from './CoordinateOverlay';
import OffscreenArrows from './OffscreenArrows';

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
  onBoxSelect?: (rect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }) => void;
  disableZoomDuringDrag?: boolean;
  allowNodeDrag?: boolean;
  isMain?: boolean;
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
}: NotesGraphViewProps) => {
  const [overlayCoords, setOverlayCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [centerCoords, setCenterCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

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
  return (
    <GraphContainer>
      <GraphDropZone
        onDrop={onDrop}
        isDraggingEdge={isDraggingEdge}
        onBoxSelect={onBoxSelect}
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
            key={layoutId}
          >
            <GraphBackground />
            <GraphControls />
            <GraphMiniMap />
            <UnposedNotesList
              layoutId={layoutId}
              onNoteSelect={onAddNoteToGraph}
            />

            <OffscreenArrows nodes={nodesWithSelection} isMain={isMain} />
            <ViewportTracker onViewportChange={v => setCenterCoords(v)} />
          </ReactFlow>
          <CoordinateOverlay
            coords={overlayCoords}
            centerCoords={centerCoords}
          />
        </div>
      </GraphDropZone>
    </GraphContainer>
  );
};

export default NotesGraphView;
