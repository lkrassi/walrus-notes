import { DeleteLayoutForm } from 'features/layout/ui/components/DeleteLayoutForm';
import { CreateNoteForm } from 'features/notes';
import {
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import cn from 'shared/lib/cn';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import type { Note } from 'shared/model/types/layouts';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { useIsMobile, useLocalization } from '../../../hooks';
import { DeleteNoteForm } from './DeleteNoteForm';

type FileTreeItemHeaderProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onOpenGraph?: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDeleteLayout?: (layoutId: string) => void;
};

export const FileTreeItemHeader = ({
  item,
  level,
  isExpanded,
  isSelected,
  onItemClick,
  onDeleteNote,
  onDeleteLayout,
}: FileTreeItemHeaderProps) => {
  const [_isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const paddingLeft = 20 + level * 16;
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();

  const showDeleteLayout = item.type === 'layout' && item.isMain !== true;
  const showDeleteNote = item.type === 'note' && item.isMain !== true;

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
      onLayoutDeleted={layoutId => {
        onDeleteLayout?.(layoutId);
      }}
    />,
    {
      title: t('layout:deleteLayout'),
      size: 'md',
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
        isSelected
          ? 'bg-primary dark:bg-dark-primary text-white'
          : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
      style={{
        paddingLeft: `${paddingLeft}px`,
        paddingRight: '12px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onClick={handleItemClick}
    >
      {item.type === 'layout' && (
        <div
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
              isSelected ? 'text-white' : 'text-text dark:text-dark-text'
            )}
          />
        </div>
      )}

      {item.type === 'note' && <div className={cn('h-4', 'w-4')} />}

      <div>
        {item.type === 'layout' ? (
          isExpanded ? (
            <FolderOpen className={cn('h-4', 'w-4')} />
          ) : (
            <Folder className={cn('h-4', 'w-4')} />
          )
        ) : (
          <FileText className={cn('h-4', 'w-4')} />
        )}
      </div>

      <span className={cn('flex-1', 'truncate', 'text-sm', 'font-medium')}>
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
            {item.isMain !== true && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleCreateNote(e);
                }}
                className={cn(
                  'transition-opacity',
                  'duration-150',
                  isMobile || _isHovered || isSelected
                    ? 'opacity-100'
                    : 'opacity-0',
                  isMobile
                    ? 'text-gray-600'
                    : isSelected
                      ? 'text-white hover:text-gray-200'
                      : 'text-gray-400 hover:text-gray-600'
                )}
                title={t('fileTree:createNote')}
              >
                <Plus className={cn('h-4', 'w-4')} />
              </button>
            )}
            {item.isMain !== true && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteLayout(e);
                }}
                className={cn(
                  'transition-opacity',
                  'duration-150',
                  isMobile || _isHovered || isSelected
                    ? 'opacity-100'
                    : 'opacity-0',
                  isMobile
                    ? 'text-gray-600'
                    : isSelected
                      ? 'text-white hover:text-gray-200'
                      : 'text-gray-400 hover:text-gray-600'
                )}
                title={t('layout:deleteLayout')}
              >
                <Trash2 className={cn('h-4', 'w-4')} />
              </button>
            )}
          </>
        )}

        {item.type === 'note' && item.isMain !== true && (
          <button
            onClick={e => {
              e.stopPropagation();
              handleDeleteNote(e);
            }}
            className={cn(
              'transition-opacity',
              'duration-150',
              isMobile || _isHovered || isSelected
                ? 'opacity-100'
                : 'opacity-0',
              isMobile
                ? 'text-gray-600'
                : isSelected
                  ? 'text-white hover:text-gray-200'
                  : 'text-gray-400 hover:text-gray-600'
            )}
            title={t('notes:deleteNote')}
          >
            <Trash2 className={cn('h-4', 'w-4')} />
          </button>
        )}
      </div>
    </div>
  );
};
