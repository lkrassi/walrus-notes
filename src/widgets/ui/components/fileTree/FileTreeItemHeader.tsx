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
import { useLocalization } from '../../../hooks';

type FileTreeItemHeaderProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onCreateNote: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
};

export const FileTreeItemHeader = ({
  item,
  level,
  isExpanded,
  isSelected,
  onItemClick,
  onCreateNote,
  onDeleteNote,
}: FileTreeItemHeaderProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const paddingLeft = 20 + level * 16;
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { t } = useLocalization();

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

  const handleCreateNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCreateNote(item.id);
  };

  const handleDeleteNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDeleteNote?.(item.id);
  };

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
        <div className='flex h-4 w-4 flex-shrink-0 items-center justify-center'>
          {isExpanded ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </div>
      )}

      {item.type === 'note' && <div className='h-4 w-4 flex-shrink-0' />}

      <div className='flex-shrink-0'>
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
          <button
            onClick={handleCreateNote}
            className={`opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${
              isSelected
                ? 'text-white hover:text-gray-200'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={t('fileTree:createNote')}
          >
            <Plus className='h-4 w-4' />
          </button>
        )}

        {item.type === 'note' && (
          <button
            onClick={handleDeleteNote}
            className={`transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            title={t('common:deleteNote.deleteBtnTitle')}
          >
            <Trash2 className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
};
