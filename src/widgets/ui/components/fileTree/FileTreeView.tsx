import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { cn } from '@/shared/lib/core';
import { useDndSensors } from '@/shared/lib/react/hooks/useDndSensors';
import { AllNotesButton } from '@/widgets/ui/components/sidebar/AllNotesButton';
import {
  DndContext,
  DragOverlay,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  restrictToFirstScrollableAncestor,
  snapCenterToCursor,
} from '@dnd-kit/modifiers';
import { FileText } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { FileTreeSection } from './FileTreeSection';
import { SearchInput } from './SearchInput';
import type {
  ActiveDragNote,
  FileTreeSection as FileTreeSectionType,
} from './model/types';

interface FileTreeViewProps {
  setSearchQuery: (value: string) => void;
  isSearchMode: boolean;
  sections: FileTreeSectionType[];
  sectionTitles: { owned: string; shared: string };
  selectedItemId?: string;
  activeDragNote: ActiveDragNote | null;
  collisionDetection: CollisionDetection;
  onDragStart: (event: DragStartEvent) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  renderSectionHeader: (title: string) => ReactNode;
  renderTreeItem: (item: FileTreeItemType, level?: number) => ReactNode;
  onAllNotesClick: () => void;
  isMobile?: boolean;
  showAllNotesButton?: boolean;
}

export const FileTreeView: FC<FileTreeViewProps> = ({
  setSearchQuery,
  isSearchMode,
  sections,
  sectionTitles,
  selectedItemId,
  activeDragNote,
  collisionDetection,
  onDragStart,
  onDragCancel,
  onDragEnd,
  renderSectionHeader,
  renderTreeItem,
  onAllNotesClick,
  isMobile = false,
  showAllNotesButton = true,
}) => {
  const sensors = useDndSensors({ mouseDistance: 5 });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
      modifiers={[restrictToFirstScrollableAncestor]}
    >
      <div
        className={cn(
          'flex',
          'h-full',
          'flex-col',
          isMobile ? 'px-3 pt-3 pb-3' : 'px-2 pt-1.5 pb-2'
        )}
      >
        <div className={cn(isMobile ? 'pb-2' : 'pb-1.5')}>
          <SearchInput onSearchChange={setSearchQuery} />
        </div>

        {!isSearchMode && showAllNotesButton && (
          <div className={cn(isMobile ? 'pb-2' : 'pb-1.5')}>
            <AllNotesButton
              onAllNotesClick={onAllNotesClick}
              isSelected={selectedItemId?.startsWith('graph-')}
            />
          </div>
        )}

        <div
          className={cn(
            'flex-1',
            'overflow-y-auto',
            isMobile ? 'pr-0.5' : 'pr-1'
          )}
        >
          {isSearchMode ? (
            <div className='space-y-0'>
              <FileTreeSection
                items={sections[0]?.items ?? []}
                renderSectionHeader={renderSectionHeader}
                renderTreeItem={renderTreeItem}
              />
            </div>
          ) : (
            <div>
              {sections.map(section => (
                <FileTreeSection
                  key={section.id}
                  title={
                    section.id === 'owned'
                      ? sectionTitles.owned
                      : section.id === 'shared'
                        ? sectionTitles.shared
                        : undefined
                  }
                  items={section.items}
                  renderSectionHeader={renderSectionHeader}
                  renderTreeItem={renderTreeItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DragOverlay
        adjustScale={false}
        dropAnimation={null}
        modifiers={[snapCenterToCursor]}
      >
        {activeDragNote ? (
          <div
            className={cn(
              'pointer-events-none',
              'flex',
              'min-w-45',
              'max-w-70',
              'items-center',
              'gap-2',
              'rounded-none',
              'border',
              'border-border/80',
              'bg-surface',
              'px-2.5',
              'py-1.5',
              'shadow-[0_8px_24px_rgba(0,0,0,0.22)]',
              'dark:border-dark-border/80',
              'dark:bg-dark-surface'
            )}
          >
            <FileText className={cn('h-3.5', 'w-3.5', 'shrink-0')} />
            <span className={cn('truncate', 'text-[13px]', 'leading-5')}>
              {activeDragNote.title || 'Untitled note'}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
