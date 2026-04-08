import { useIsMobile } from '@/shared/lib/react/hooks';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { memo, useEffect, useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import 'reactflow/dist/style.css';
import {
  useGraphContextActions,
  useGraphContextState,
} from '../../lib/context';
import {
  useGraphDndOrchestration,
  useGraphNodeInteractions,
  useGraphViewport,
} from '../../lib/hooks';
import { useGraphNodeContextMenu } from '../../model/hooks/useGraphNodeContextMenu';
import { CoordinateOverlay } from './CoordinateOverlay';
import { GraphContainer } from './GraphContainer';
import { GraphDropZone } from './GraphDropZone';
import { GraphNodeContextMenu } from './GraphNodeContextMenu';
import { GraphReactFlowCore } from './GraphReactFlowCore';
import { GraphStatusOverlay } from './GraphStatusOverlay';
import { GraphViewProvider } from './GraphViewContext';
import { NoteDragOverlay } from './NoteDragOverlay';
import { TouchEnabledGraph } from './TouchEnabledGraph';
import { UnposedNotesList } from './UnposedNotesList';

export const NotesGraphView: FC = memo(function NotesGraphView() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const {
    layoutId,
    isRefreshing,
    nodesWithSelection,
    edgesWithSelection,
    screenToFlowPosition,
    allowNodeDrag,
    isDraggingEdge,
    canEdit,
    onNoteOpenPinned,
  } = useGraphContextState();
  const { onNodeDragStop, onPaneClick, onDrop, onAddNoteToGraph } =
    useGraphContextActions();

  const { centerCoords, setCenterCoords, ViewportTracker } = useGraphViewport();

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
    sensors,
    collisionDetection,
    onDragStart,
    onDragEnd,
    activeDragNote,
    activeDragId,
    activeDragSize,
    lastDndDropAt,
    dragOverlayModifiers,
  } = useGraphDndOrchestration({
    onAddNoteToGraph,
    screenToFlowPosition,
    centerCoords,
  });

  const [isUnposedListOpen, setIsUnposedListOpen] = useState(false);
  const {
    contextMenu,
    handleNodeContextMenu,
    handleOpenNoteFromMenu,
    handleDeleteNoteFromMenu,
    handlePaneClick,
  } = useGraphNodeContextMenu({
    onNoteOpenPinned,
    onPaneClick,
  });

  const unposedOffset = isUnposedListOpen ? 'min(400px, 45vw)' : '0px';
  const summary = useMemo(
    () => ({
      nodesCount: nodesWithSelection.length,
      edgesCount: edgesWithSelection.length,
    }),
    [nodesWithSelection.length, edgesWithSelection.length]
  );

  useEffect(() => {
    setIsUnposedListOpen(false);
  }, [layoutId]);

  const graphViewValue = useMemo(
    () => ({
      onNodeDragStop: handleNodeDragStop,
      onNodeDrag: handleNodeDrag,
      onNodeContextMenu: handleNodeContextMenu,
      onPaneClick: handlePaneClick,
      ViewportTracker,
      onViewportChange: setCenterCoords,
      minimapOffset: unposedOffset,
    }),
    [
      ViewportTracker,
      handleNodeContextMenu,
      handleNodeDrag,
      handleNodeDragStop,
      handlePaneClick,
      setCenterCoords,
      unposedOffset,
    ]
  );

  return (
    <GraphContainer>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <GraphDropZone
          onDrop={onDrop}
          isDraggingEdge={isDraggingEdge}
          activeDragNote={activeDragNote}
          lastDndDropAt={lastDndDropAt}
        >
          <TouchEnabledGraph
            nodes={nodesWithSelection}
            onNodePositionChange={handleTouchNodePositionChange}
            disabled={!isMobile || allowNodeDrag === false || !canEdit}
          >
            <div className='relative h-full w-full'>
              <GraphStatusOverlay
                canEdit={canEdit}
                isRefreshing={isRefreshing}
                nodesCount={summary.nodesCount}
                edgesCount={summary.edgesCount}
                t={t}
              />

              <GraphViewProvider value={graphViewValue}>
                <GraphReactFlowCore />
              </GraphViewProvider>

              <CoordinateOverlay
                coords={overlayCoords}
                centerCoords={centerCoords}
                rightOffset={unposedOffset}
              />

              <GraphNodeContextMenu
                contextMenu={contextMenu}
                canEdit={canEdit}
                openLabel={t('notes:openNote')}
                deleteLabel={t('notes:deleteNote')}
                onOpen={handleOpenNoteFromMenu}
                onDelete={handleDeleteNoteFromMenu}
              />
            </div>
          </TouchEnabledGraph>
        </GraphDropZone>

        <UnposedNotesList
          layoutId={layoutId}
          onNoteSelect={onAddNoteToGraph}
          isOpen={isUnposedListOpen}
          onOpenChange={setIsUnposedListOpen}
        />

        <DragOverlay dropAnimation={null} modifiers={dragOverlayModifiers}>
          <NoteDragOverlay
            note={activeDragNote}
            isCompact={activeDragId?.startsWith('unposed-') ?? false}
            previewSize={activeDragSize}
          />
        </DragOverlay>
      </DndContext>
    </GraphContainer>
  );
});
