import { DeleteLayoutForm } from 'features/layout/ui/components/DeleteLayoutForm';
import { CreateNoteForm } from 'features/notes';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { useIsMobile, useLocalization } from '../../../hooks';
import { useModalActions } from '../../../hooks/useModalActions';
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
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const paddingLeft = 20 + level * 16;
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { t } = useLocalization();
  const { createAnimatedOpener } = useModalActions();

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

  // Обработчики с анимацией
  const handleDeleteNote = createAnimatedOpener(
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

  const handleCreateNote = createAnimatedOpener(
    <CreateNoteForm layoutId={item.id} onNoteCreated={note => {}} />,
    {
      title: t('fileTree:createNewNote'),
      size: 'lg',
    }
  );

  const handleDeleteLayout = createAnimatedOpener(
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
      className={`group relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 transition-all duration-150 ${
        isSelected
          ? 'bg-primary dark:bg-dark-primary text-white'
          : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
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
        <div className='flex h-4 w-4 items-center justify-center'>
          {isExpanded ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </div>
      )}

      {item.type === 'note' && <div className='h-4 w-4' />}

      <div>
        {item.type === 'layout' ? (
          isExpanded ? (
            <FolderOpen className='h-4 w-4' />
          ) : (
            <Folder className='h-4 w-4' />
          )
        ) : (
          <FileText className='h-4 w-4' />
        )}
      </div>

      <span className='flex-1 truncate text-sm font-medium'>{item.title}</span>

      <div className='flex items-center gap-1'>
        {item.type === 'layout' && (
          <>
            <button
              onClick={handleCreateNote}
              className={`transition-opacity duration-150 ${
                isMobile
                  ? 'text-gray-600 opacity-100'
                  : `opacity-0 group-hover:opacity-100 ${
                      isSelected
                        ? 'text-white hover:text-gray-200'
                        : 'text-gray-400 hover:text-gray-600'
                    }`
              }`}
              title={t('fileTree:createNote')}
            >
              <Plus className='h-4 w-4' />
            </button>
            <button
              onClick={handleDeleteLayout}
              className={`transition-opacity duration-150 ${
                isMobile
                  ? 'text-red-600 opacity-100'
                  : `opacity-0 group-hover:opacity-100 ${
                      isSelected
                        ? 'text-white hover:text-red-200'
                        : 'text-gray-400 hover:text-red-600'
                    }`
              }`}
              title={t('layout:deleteLayout')}
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </>
        )}

        {item.type === 'note' && (
          <button
            onClick={handleDeleteNote}
            className={`transition-opacity duration-150 ${
              isMobile ? 'opacity-100' : isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            title={t('notes:delete')}
          >
            <Trash2 className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
};
