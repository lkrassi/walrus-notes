import type { Note } from '@/entities/note';
import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { DeleteLayoutForm, UpdateLayoutForm } from '@/features/layout';
import { useShareModal } from '@/features/share';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS } from '@/shared/lib/react';
import { FolderIcon } from '@/shared/ui/icons/FolderIcon';
import { FolderOpenIcon } from '@/shared/ui/icons/FolderOpenIcon';
import { useIsMobile, useLocalization, useModalActions } from '@/widgets/hooks';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, FileText, Pin, Trash2 } from 'lucide-react';
import { DeleteNoteForm } from './DeleteNoteForm';
import { FileTreeItemActions } from './FileTreeItemActions';

type FileTreeItemHeaderProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isPinned?: boolean;
  isAnyNoteDragging?: boolean;
  hasSelection?: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onTogglePin?: (item: FileTreeItemType) => void;
  onItemDoubleClick?: (item: FileTreeItemType) => void;
  onOpenGraph?: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDeleteLayout?: (layoutId: string) => void;
  toggleExpanded?: (itemId: string) => void;
};

export const FileTreeItemHeader = ({
  item,
  level,
  isExpanded,
  isSelected,
  isPinned = false,
  isAnyNoteDragging,
  hasSelection: _hasSelection,
  onItemClick,
  onTogglePin,
  onItemDoubleClick,
  onOpenGraph,
  onDeleteNote,
  onDeleteLayout,
  toggleExpanded,
}: FileTreeItemHeaderProps) => {
  const isMobile = useIsMobile();
  const paddingLeft = 10 + level * 12;

  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();
  const { openShareLinkModal } = useShareModal();
  const canWrite = item.access ? !!item.access.canWrite : true;
  const canEdit = item.access ? !!item.access.canEdit : true;

  const handleItemClick = () => onItemClick(item);
  const handleItemDoubleClick = () => onItemDoubleClick?.(item);

  const renderHighlighted = (text: string, query?: string) => {
    if (!query) return text;
    const q = query.toLowerCase();
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span
          className={cn(
            'bg-yellow-200',
            'dark:bg-yellow-600',
            'text-black',
            'dark:text-white',
            'px-0.5',
            'rounded'
          )}
        >
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const handleDeleteNote = openModalFromTrigger(
    <DeleteNoteForm
      noteId={item.id}
      noteTitle={item.title}
      onNoteDeleted={noteId => {
        onDeleteNote?.(noteId);
      }}
    />,
    {
      title: t('notes:deleteNote'),
      size: MODAL_SIZE_PRESETS.noteDelete,
    }
  );

  const handleDeleteLayout = openModalFromTrigger(
    <DeleteLayoutForm
      layoutId={item.id}
      layoutTitle={item.title}
      onLayoutDeleted={(layoutId: string) => {
        onDeleteLayout?.(layoutId);
      }}
    />,
    {
      title: t('layout:deleteLayout'),
      size: MODAL_SIZE_PRESETS.layoutDelete,
    }
  );

  const handleUpdateLayout = openModalFromTrigger(
    <UpdateLayoutForm
      layoutId={item.id}
      layoutTitle={item.title}
      layoutColor={item.color}
      onLayoutUpdated={() => {}}
    />,
    {
      title: t('layout:updateLayoutData') || 'Edit layout',
      size: MODAL_SIZE_PRESETS.layoutUpdate,
    }
  );

  const isDraggableNote = item.type === 'note' && canWrite && !item.isMain;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: {
      type: 'note',
      noteId: item.id,
      fromLayoutId: item.parentId,
      title: item.title,
    },
    disabled: !isDraggableNote,
  });

  const draggableProps = isDraggableNote
    ? {
        ...attributes,
        ...listeners,
        style: {
          opacity: isDragging ? 0 : 1,
          zIndex: isDragging ? 30 : 'auto',
        },
      }
    : {};

  const dragRef = isDraggableNote ? setNodeRef : undefined;

  return (
    <div
      className={cn(
        'group',
        'w-full',
        item.type === 'note' && isAnyNoteDragging && 'pointer-events-none'
      )}
      ref={dragRef}
      {...draggableProps}
    >
      <div
        className={cn(
          'relative',
          'flex',
          'w-full',
          'cursor-pointer',
          'items-center',
          'gap-1.5',
          'rounded-none',
          'py-0.5',
          'min-h-7',
          'transition-opacity',
          'duration-150',
          'text-text',
          'dark:text-dark-text',
          item.type === 'layout'
            ? 'hover:bg-primary/12 dark:hover:bg-primary/50'
            : !isAnyNoteDragging &&
                'hover:bg-primary/12 dark:hover:bg-primary/50',
          isSelected &&
            cn(
              'bg-primary/20',
              'dark:bg-primary/45',
              'dark:text-white',
              'before:bg-primary before:absolute before:top-0 before:left-0 before:h-full before:w-0.5'
            )
        )}
        style={{
          paddingLeft: `${paddingLeft}px`,
          paddingRight: '8px',
        }}
        onClick={handleItemClick}
        onDoubleClick={handleItemDoubleClick}
      >
        {item.type === 'layout' && item.isMain !== true && (
          <button
            type='button'
            aria-label={
              isExpanded
                ? t('fileTree:collapseFolder') || 'Collapse folder'
                : t('fileTree:expandFolder') || 'Expand folder'
            }
            title={
              isExpanded
                ? t('fileTree:collapseFolder') || 'Collapse folder'
                : t('fileTree:expandFolder') || 'Expand folder'
            }
            onClick={e => {
              e.stopPropagation();
              toggleExpanded?.(item.id);
            }}
            className={cn(
              'flex',
              'h-3.5',
              'w-3.5',
              'items-center',
              'justify-center',
              'transition-transform',
              'duration-200'
            )}
          >
            <ChevronDown
              className={cn(
                'h-3.5',
                'w-3.5',
                'transform',
                'transition-transform',
                'duration-200',
                isExpanded ? 'rotate-0' : '-rotate-90',
                'text-black',
                'dark:text-white'
              )}
            />
          </button>
        )}

        {item.type === 'note' && <div className={cn('h-3.5', 'w-3.5')} />}

        <div>
          {item.type === 'layout' ? (
            isExpanded ? (
              <FolderOpenIcon
                className={cn('h-4', 'w-4')}
                fillColor={item.color}
              />
            ) : (
              <FolderIcon className={cn('h-4', 'w-4')} fillColor={item.color} />
            )
          ) : (
            <FileText className={cn('h-3.5', 'w-3.5')} />
          )}
        </div>

        <span
          title={item.title}
          className={cn(
            'flex-1',
            'min-w-0',
            'truncate',
            'text-[13px]',
            'leading-5',
            isSelected ? 'font-medium' : 'font-normal'
          )}
        >
          {item.title}
          {item.type === 'note' &&
            (() => {
              const noteWithMatch = (
                item as unknown as {
                  note?: Note & {
                    _match?: {
                      field: 'title' | 'payload';
                      snippet: string;
                      query: string;
                    };
                  };
                }
              ).note;
              const match = noteWithMatch?._match;
              if (!match) return null;
              return (
                <div
                  className={cn(
                    'text-xs',
                    'mt-0.5',
                    'text-gray-500',
                    'dark:text-gray-400',
                    'truncate'
                  )}
                >
                  <span className={cn('align-middle')}>
                    {renderHighlighted(match.snippet, match.query)}
                  </span>
                </div>
              );
            })()}
        </span>

        <div className={cn('flex', 'items-center', 'gap-1')}>
          {(item.type === 'layout' || item.type === 'note') &&
            item.isMain !== true && (
              <button
                onPointerDown={e => {
                  e.stopPropagation();
                }}
                onClick={e => {
                  e.stopPropagation();
                  onTogglePin?.(item);
                }}
                className={cn(
                  !isAnyNoteDragging && 'transition-opacity duration-150',
                  isPinned ? 'opacity-100' : 'opacity-0',
                  !isAnyNoteDragging && 'group-hover:opacity-100',
                  !isAnyNoteDragging && 'group-focus-within:opacity-100',
                  'flex h-5 w-5 items-center justify-center',
                  isAnyNoteDragging &&
                    item.type === 'note' &&
                    'pointer-events-none',
                  isMobile
                    ? 'text-gray-600 opacity-100 dark:text-white'
                    : isPinned
                      ? 'text-primary dark:text-dark-primary'
                      : 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                )}
                title={
                  isPinned
                    ? t('fileTree:unpinItem') || 'Unpin'
                    : t('fileTree:pinItem') || 'Pin'
                }
                aria-label={
                  isPinned
                    ? t('fileTree:unpinItem') || 'Unpin'
                    : t('fileTree:pinItem') || 'Pin'
                }
              >
                <Pin
                  className={cn('h-3.5', 'w-3.5', isPinned && 'fill-current')}
                />
              </button>
            )}

          {item.type === 'layout' && item.isMain !== true && canEdit && (
            <div
              className={cn(
                !isAnyNoteDragging && 'transition-opacity duration-150',
                isMobile || isSelected ? 'opacity-100' : 'opacity-0',
                !isAnyNoteDragging && 'group-hover:opacity-100',
                !isAnyNoteDragging && 'group-focus-within:opacity-100',
                !isMobile &&
                  !isSelected &&
                  !isAnyNoteDragging &&
                  'pointer-events-none group-focus-within:pointer-events-auto group-hover:pointer-events-auto'
              )}
            >
              <FileTreeItemActions
                onShare={e => {
                  e.stopPropagation();
                  openShareLinkModal(item.id, 'LAYOUT')(e);
                }}
                onEdit={e => {
                  e.stopPropagation();
                  handleUpdateLayout(e);
                }}
                onDelete={e => {
                  e.stopPropagation();
                  handleDeleteLayout(e);
                }}
                onOpenGraph={
                  onOpenGraph
                    ? e => {
                        e.stopPropagation();
                        onOpenGraph(item.id);
                      }
                    : undefined
                }
                isMobile={isMobile}
                titleShare={t('layout:tooltip.share')}
                titleEdit={t('layout:tooltip.edit')}
                titleDelete={t('layout:tooltip.delete')}
                titleOpenGraph={t('layout:tooltip.graph')}
              />
            </div>
          )}
          {item.type === 'note' && item.isMain !== true && canWrite && (
            <>
              <button
                onPointerDown={e => {
                  e.stopPropagation();
                }}
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteNote(e);
                }}
                className={cn(
                  !isAnyNoteDragging && 'transition-opacity duration-150',
                  'opacity-0',
                  !isAnyNoteDragging && 'group-hover:opacity-100',
                  !isAnyNoteDragging && 'group-focus-within:opacity-100',
                  'flex h-5 w-5 items-center justify-center',
                  isAnyNoteDragging && 'pointer-events-none',
                  isMobile
                    ? 'text-gray-600 opacity-100 dark:text-white'
                    : isAnyNoteDragging
                      ? 'text-text/50 dark:text-dark-text/50'
                      : 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                )}
                title={t('notes:deleteNote')}
              >
                <Trash2 className={cn('h-4', 'w-4')} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
