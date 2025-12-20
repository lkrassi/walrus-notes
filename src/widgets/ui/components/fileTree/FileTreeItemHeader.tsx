import { DeleteLayoutForm } from 'features/layout/ui/components/DeleteLayoutForm';
import UpdateLayoutForm from 'features/layout/ui/components/UpdateLayoutForm';
import FolderIcon from 'shared/ui/icons/FolderIcon';
import FolderOpenIcon from 'shared/ui/icons/FolderOpenIcon';
import { CreateNoteForm } from 'features/notes';
import { ChevronDown, FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import cn from 'shared/lib/cn';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import type { Note } from 'shared/model/types/layouts';
import { useModalActions } from 'widgets/hooks/useModalActions';
import EditNoteModal from 'features/notes/ui/components/EditNoteModal';
import { useUpdateNoteMutation } from 'app/store/api';
import { useNotifications } from 'widgets';
import { useIsMobile, useLocalization } from '../../../hooks';
import { DeleteNoteForm } from './DeleteNoteForm';

type FileTreeItemHeaderProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasSelection?: boolean;
  onItemClick: (item: FileTreeItemType) => void;
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
  hasSelection,
  onItemClick,
  onDeleteNote,
  onDeleteLayout,
  toggleExpanded,
}: FileTreeItemHeaderProps) => {
  const [_isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const paddingLeft = 20 + level * 16;
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 100);
  };

  const handleItemClick = () => onItemClick(item);

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
      size: 'md',
    }
  );

  const [updateNote] = useUpdateNoteMutation();
  const { showError } = useNotifications();

  const handleEditNote = openModalFromTrigger(
    <EditNoteModal
      title={item.title}
      onSaved={async (newTitle: string) => {
        try {
          await updateNote({ noteId: item.id, title: newTitle }).unwrap();
        } catch (_e) {
          try {
            showError('notes:noteUpdateError');
          } catch (_err) {}
        }
      }}
    />,
    {
      title: t('notes:editTitle') || 'Edit title',
      size: 'md',
    }
  );

  const handleCreateNote = openModalFromTrigger(
    <CreateNoteForm layoutId={item.id} />,
    {
      title: t('fileTree:createNewNote'),
      size: 'lg',
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
      size: 'md',
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
      size: 'lg',
    }
  );

  return (
    <div
      className={cn(
        'relative',
        'flex',
        'w-full',
        'cursor-pointer',
        'items-center',
        'gap-2',
        'rounded-lg',
        'py-2',
        'transition-opacity',
        'duration-150',
        'text-text',
        'dark:text-dark-text'
      )}
      style={{
        paddingLeft: `${paddingLeft}px`,
        paddingRight: '12px',
        ...(hasSelection &&
        !isSelected &&
        (item.type === 'layout' || item.type === 'note')
          ? { opacity: 0.5 }
          : {}),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onClick={handleItemClick}
    >
      {item.type === 'layout' && item.isMain !== true && (
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            toggleExpanded?.(item.id);
          }}
          className={cn(
            'flex',
            'h-4',
            'w-4',
            'items-center',
            'justify-center',
            'transition-transform',
            'duration-200'
          )}
        >
          <ChevronDown
            className={cn(
              'h-4',
              'w-4',
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

      {item.type === 'note' && <div className={cn('h-4', 'w-4')} />}

      <div>
        {item.type === 'layout' ? (
          isExpanded ? (
            <div
              className={cn(
                'h-6',
                'w-6',
                'flex',
                'items-center',
                'justify-center',
                'rounded-full',
                isSelected && !item.color
                  ? 'bg-primary dark:bg-primary-dark text-white'
                  : ''
              )}
            >
              <FolderOpenIcon
                className={cn('h-6', 'w-6')}
                fillColor={item.color}
              />
            </div>
          ) : (
            <div
              className={cn(
                'h-6',
                'w-6',
                'flex',
                'items-center',
                'justify-center',
                'rounded-full',
                isSelected && !item.color
                  ? 'bg-primary dark:bg-primary-dark text-white'
                  : ''
              )}
            >
              <FolderIcon className={cn('h-6', 'w-6')} fillColor={item.color} />
            </div>
          )
        ) : (
          <FileText className={cn('h-4', 'w-4')} />
        )}
      </div>

      <span
        title={item.title}
        className={cn(
          'flex-1',
          'min-w-0',
          'truncate',
          'text-sm',
          'font-medium'
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
        {item.type === 'layout' && (
          <>
            {item.isMain !== true && isSelected && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleCreateNote(e);
                }}
                className={cn(
                  'transition-opacity',
                  'duration-150',
                  'opacity-100',
                  isMobile
                    ? 'text-gray-600 dark:text-white'
                    : isSelected
                      ? 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                      : 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                )}
                title={t('fileTree:createNote')}
              >
                <Plus className={cn('h-4', 'w-4')} />
              </button>
            )}
            {item.isMain !== true && isSelected && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleUpdateLayout(e);
                }}
                className={cn(
                  'transition-opacity',
                  'duration-150',
                  'opacity-100',
                  isMobile
                    ? 'text-gray-600 dark:text-white'
                    : isSelected
                      ? 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                      : 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                )}
                title={t('layout:edit') || 'Edit'}
              >
                <Pencil className={cn('h-4', 'w-4')} />
              </button>
            )}
            {item.isMain !== true && isSelected && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteLayout(e);
                }}
                className={cn(
                  'transition-opacity',
                  'duration-150',
                  'opacity-100',
                  isMobile
                    ? 'text-gray-600 dark:text-white'
                    : isSelected
                      ? 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                      : 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                )}
                title={t('layout:deleteLayout')}
              >
                <Trash2 className={cn('h-4', 'w-4')} />
              </button>
            )}
          </>
        )}

        {item.type === 'note' && item.isMain !== true && isSelected && (
          <>
            <button
              onClick={e => {
                e.stopPropagation();
                handleEditNote(e);
              }}
              className={cn(
                'transition-opacity',
                'duration-150',
                'opacity-100',
                isMobile
                  ? 'text-gray-600 dark:text-white'
                  : isSelected
                    ? 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
                    : 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
              )}
              title={t('notes:edit') || 'Edit'}
            >
              <Pencil className={cn('h-4', 'w-4')} />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                handleDeleteNote(e);
              }}
              className={cn(
                'transition-opacity',
                'duration-150',
                'opacity-100',
                isMobile
                  ? 'text-gray-600 dark:text-white'
                  : isSelected
                    ? 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
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
  );
};
