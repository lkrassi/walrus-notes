import type { UseGraphHistoryReturn } from '@/entities/graph';
import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import { useDndSensors, useIsMobile } from '@/shared/lib/react/hooks';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { Eye, Grip, Network, Trash2 } from 'lucide-react';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type FC,
  type MouseEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { Edge, Node, ReactFlowProps } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  useGraphDragAndDrop,
  useGraphNodeInteractions,
  useGraphViewport,
} from '../../lib/hooks';
import { CoordinateOverlay } from './CoordinateOverlay';
import { GraphContainer } from './GraphContainer';
import { GraphDeleteNoteForm } from './GraphDeleteNoteForm';
import { GraphDropZone } from './GraphDropZone';
import { GraphReactFlowCore } from './GraphReactFlowCore';
import { NoteDragOverlay } from './NoteDragOverlay';
import { TouchEnabledGraph } from './TouchEnabledGraph';
import { UnposedNotesList } from './UnposedNotesList';

interface NotesGraphViewProps {
  layoutId: string;
  isRefreshing?: boolean;
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
  onNoteOpenPinned?: (noteData: { noteId: string; note: Note }) => void;
}

export const NotesGraphView: FC<NotesGraphViewProps> = memo(
  function NotesGraphView({
    layoutId,
    isRefreshing = false,
    screenToFlowPosition,
    nodes: _nodes,
    edges,
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
    onNoteOpenPinned,
  }: NotesGraphViewProps) {
    const { t } = useTranslation();
    const { openModalFromTrigger } = useModalActions();
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

    const {
      activeDragNote,
      activeDragId,
      activeDragSize,
      handleDndDragStart,
      handleDndDragEnd,
    } = useGraphDragAndDrop({
      onAddNoteToGraph: onAddNoteToGraph ?? (() => {}),
      screenToFlowPosition,
      centerCoords,
    });

    const [lastDndDropAt, setLastDndDropAt] = useState<number | null>(null);
    const [isUnposedListOpen, setIsUnposedListOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
      note: Note;
    } | null>(null);
    const unposedOffset = isUnposedListOpen ? 'min(400px, 45vw)' : '0px';
    const summary = useMemo(
      () => ({
        nodesCount: nodesWithSelection.length,
        edgesCount: edges.length,
      }),
      [nodesWithSelection.length, edges.length]
    );

    useEffect(() => {
      setIsUnposedListOpen(false);
    }, [layoutId]);

    useEffect(() => {
      if (!contextMenu) {
        return;
      }

      const onDocPointerDown = (event: globalThis.MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('[data-graph-node-context-menu="true"]')) {
          return;
        }
        setContextMenu(null);
      };

      const onEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setContextMenu(null);
        }
      };

      document.addEventListener('mousedown', onDocPointerDown);
      document.addEventListener('keydown', onEsc);

      return () => {
        document.removeEventListener('mousedown', onDocPointerDown);
        document.removeEventListener('keydown', onEsc);
      };
    }, [contextMenu]);

    const collisionDetection = useCallback<CollisionDetection>(args => {
      const pointerCollisions = pointerWithin(args);

      if (pointerCollisions.length === 0) {
        return closestCenter(args);
      }

      const unposedCollisions = pointerCollisions.filter(collision => {
        const collisionId = collision.id.toString();
        return (
          collisionId === 'unposed-panel-drop' ||
          collisionId === 'unposed-grid-drop' ||
          collisionId.startsWith('unposed-')
        );
      });

      if (unposedCollisions.length > 0) {
        return unposedCollisions;
      }

      const graphCollision = pointerCollisions.find(
        collision => collision.id.toString() === 'graph-drop-zone'
      );

      if (graphCollision) {
        return [graphCollision];
      }

      return pointerCollisions;
    }, []);

    const handleNodeContextMenu = useCallback(
      (event: MouseEvent, node: Node) => {
        event.preventDefault();
        event.stopPropagation();

        const note = (node.data as { note?: Note } | undefined)?.note;
        if (!note) {
          setContextMenu(null);
          return;
        }

        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          note,
        });
      },
      []
    );

    const handleOpenNoteFromMenu = useCallback(() => {
      if (!contextMenu) return;
      const noteData = { noteId: contextMenu.note.id, note: contextMenu.note };
      onNoteOpenPinned?.(noteData);
      setContextMenu(null);
    }, [contextMenu, onNoteOpenPinned]);

    const handleDeleteNoteFromMenu = useCallback(
      (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (!contextMenu) return;

        const note = contextMenu.note;
        openModalFromTrigger(
          <GraphDeleteNoteForm noteId={note.id} noteTitle={note.title} />,
          {
            title: t('notes:deleteNote'),
            size: MODAL_SIZE_PRESETS.noteDelete,
            showCloseButton: true,
          }
        )(event);

        setContextMenu(null);
      },
      [contextMenu, openModalFromTrigger, t]
    );

    const handlePaneClick = useCallback(
      (event: MouseEvent) => {
        setContextMenu(null);
        onPaneClick(event);
      },
      [onPaneClick]
    );

    return (
      <GraphContainer>
        <DndContext
          sensors={useDndSensors({
            mouseDistance: 5,
            touchDelay: 100,
            touchTolerance: 5,
          })}
          collisionDetection={collisionDetection}
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
                <div className='pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2'>
                  <div className='border-border/75 dark:border-dark-border/70 bg-bg/80 dark:bg-dark-bg/80 text-text dark:text-dark-text inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium tracking-widest uppercase'>
                    <Network className='h-3.5 w-3.5' />
                    {t('notes:graphStatsNotes', { count: summary.nodesCount })}
                  </div>
                  <div className='border-border/75 dark:border-dark-border/70 bg-bg/80 dark:bg-dark-bg/80 text-text dark:text-dark-text inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium tracking-widest uppercase'>
                    <Grip className='h-3.5 w-3.5' />
                    {t('notes:graphStatsLinks', { count: summary.edgesCount })}
                  </div>
                  {!canEdit && (
                    <div className='border-border/75 dark:border-dark-border/70 bg-bg/80 dark:bg-dark-bg/80 text-muted-foreground dark:text-dark-muted-foreground inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-medium tracking-widest uppercase'>
                      {t('notes:graphViewOnly')}
                    </div>
                  )}
                </div>

                {isRefreshing && (
                  <div
                    className='pointer-events-none absolute top-3 right-3 z-20'
                    aria-hidden
                  >
                    <div className='bg-secondary/70 dark:bg-dark-secondary/70 h-2 w-2 animate-pulse rounded-full' />
                  </div>
                )}
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
                  onNodeContextMenu={handleNodeContextMenu}
                  onPaneClick={handlePaneClick}
                  onNodeDoubleClick={onNodeDoubleClick}
                  disableZoomDuringDrag={disableZoomDuringDrag}
                  allowNodeDrag={allowNodeDrag}
                  canEdit={canEdit}
                  isMain={isMain}
                  graphHistory={graphHistory}
                  ViewportTracker={ViewportTracker}
                  onViewportChange={setCenterCoords}
                  minimapOffset={unposedOffset}
                />
                <CoordinateOverlay
                  coords={overlayCoords}
                  centerCoords={centerCoords}
                  rightOffset={unposedOffset}
                />

                {contextMenu && (
                  <div
                    data-graph-node-context-menu='true'
                    role='menu'
                    className={cn(
                      'w-40',
                      'border-border',
                      'dark:border-dark-border',
                      'bg-bg',
                      'dark:bg-dark-bg',
                      'text-text',
                      'dark:text-dark-text',
                      'border',
                      'fixed z-50 w-48 border'
                    )}
                    style={{
                      left: contextMenu.x,
                      top: contextMenu.y,
                    }}
                  >
                    <button
                      role='menuitem'
                      type='button'
                      onClick={handleOpenNoteFromMenu}
                      className={cn(
                        'hover:bg-muted-foreground/10 flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors'
                      )}
                      title={t('notes:openNote')}
                    >
                      <Eye className='h-3.5 w-3.5' />
                      <span>{t('notes:openNote')}</span>
                    </button>

                    {canEdit && (
                      <button
                        role='menuitem'
                        type='button'
                        onClick={handleDeleteNoteFromMenu}
                        className={cn(
                          'hover:bg-muted-foreground/10 text-danger flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors'
                        )}
                        title={t('notes:deleteNote')}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                        <span>{t('notes:deleteNote')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </TouchEnabledGraph>
          </GraphDropZone>
          <UnposedNotesList
            layoutId={layoutId}
            onNoteSelect={onAddNoteToGraph ?? (() => {})}
            isOpen={isUnposedListOpen}
            onOpenChange={setIsUnposedListOpen}
          />
          <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
            <NoteDragOverlay
              note={activeDragNote}
              isCompact={activeDragId?.startsWith('unposed-') ?? false}
              previewSize={activeDragSize}
            />
          </DragOverlay>
        </DndContext>
      </GraphContainer>
    );
  }
);
