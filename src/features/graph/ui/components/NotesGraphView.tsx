import type { UseGraphHistoryReturn } from '@/entities/graph';
import type { Note } from '@/entities/note';
import { useDndSensors, useIsMobile } from '@/shared/lib/react/hooks';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import {
  memo,
  useState,
  type DragEvent,
  type FC,
  type MouseEvent,
} from 'react';
import type { Edge, Node, ReactFlowProps } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  useGraphDragAndDrop,
  useGraphNodeInteractions,
  useGraphViewport,
} from '../../lib/hooks';
import { CoordinateOverlay } from './CoordinateOverlay';
import { GraphContainer } from './GraphContainer';
import { GraphDropZone } from './GraphDropZone';
import { GraphReactFlowCore } from './GraphReactFlowCore';
import { NoteDragOverlay } from './NoteDragOverlay';
import { TouchEnabledGraph } from './TouchEnabledGraph';
import { UnposedNotesList } from './UnposedNotesList';

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
  onNodeDragStop?: (event: MouseEvent, node: Node, nodes?: Node[]) => void;
  onNodeDragStart?: ReactFlowProps['onNodeDragStart'];
  onNodeClick: ReactFlowProps['onNodeClick'];
  onNodeMouseEnter: ReactFlowProps['onNodeMouseEnter'];
  onNodeMouseLeave: ReactFlowProps['onNodeMouseLeave'];
  onPaneClick: (event: MouseEvent) => void;
  onNodeDoubleClick: (event: MouseEvent, node: Node) => void;
  isDraggingEdge: boolean;
  onDrop?: (event: DragEvent) => void;
  onAddNoteToGraph?: (note: Note, position?: { x: number; y: number }) => void;
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
  canEdit?: boolean;
}

export const NotesGraphView: FC<NotesGraphViewProps> = memo(
  function NotesGraphView({
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
    canEdit = true,
  }: NotesGraphViewProps) {
    const isMobile = useIsMobile();

    const { centerCoords, setCenterCoords, ViewportTracker } =
      useGraphViewport();

    const {
      overlayCoords,
      handleNodeDrag,
      handleNodeDragStop,
      handleTouchNodePositionChange,
    } = useGraphNodeInteractions({
      nodesWithSelection,
      onNodeDragStop,
    });

    const { activeDragNote, handleDndDragStart, handleDndDragEnd } =
      useGraphDragAndDrop({
        onAddNoteToGraph,
        screenToFlowPosition,
        centerCoords,
      });

    const [lastDndDropAt, setLastDndDropAt] = useState<number | null>(null);

    return (
      <GraphContainer>
        <DndContext
          sensors={useDndSensors({
            mouseDistance: 5,
            touchDelay: 100,
            touchTolerance: 5,
          })}
          onDragStart={handleDndDragStart}
          onDragEnd={event => {
            try {
              handleDndDragEnd(event);
            } finally {
              setLastDndDropAt(Date.now());
            }
          }}
        >
          <GraphDropZone
              onDrop={onDrop ?? (() => {})}
            isDraggingEdge={isDraggingEdge}
            onBoxSelect={onBoxSelect}
            activeDragNote={activeDragNote}
            lastDndDropAt={lastDndDropAt}
          >
            <TouchEnabledGraph
              nodes={nodesWithSelection}
              onNodePositionChange={handleTouchNodePositionChange}
              disabled={!isMobile || allowNodeDrag === false || !canEdit}
            >
              <div className='relative h-full w-full'>
                <GraphReactFlowCore
                  layoutId={layoutId}
                  nodesWithSelection={nodesWithSelection}
                  edgesWithSelection={edgesWithSelection}
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
                  onNodeDoubleClick={onNodeDoubleClick}
                  disableZoomDuringDrag={disableZoomDuringDrag}
                  allowNodeDrag={allowNodeDrag}
                  canEdit={canEdit}
                  isMain={isMain}
                  graphHistory={graphHistory}
                  ViewportTracker={ViewportTracker}
                  onViewportChange={setCenterCoords}
                />
                <CoordinateOverlay
                  coords={overlayCoords}
                  centerCoords={centerCoords}
                />
              </div>
            </TouchEnabledGraph>
          </GraphDropZone>
          <UnposedNotesList
            layoutId={layoutId}
            onNoteSelect={onAddNoteToGraph ?? (() => {})}
          />
          <DragOverlay>
            <NoteDragOverlay note={activeDragNote} />
          </DragOverlay>
        </DndContext>
      </GraphContainer>
    );
  }
);
