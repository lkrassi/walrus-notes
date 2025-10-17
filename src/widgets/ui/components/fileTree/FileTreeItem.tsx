import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { useLocalization } from '../../../hooks';

type FileTreeItemProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onCreateNote: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  childrenItems?: FileTreeItemType[];
  renderChild?: (child: FileTreeItemType, level: number) => React.ReactNode;
};

export const FileTreeItem = ({
  item,
  level,
  isExpanded,
  isSelected,
  hasChildren,
  onItemClick,
  onCreateNote,
  onDeleteNote,
  childrenItems,
  renderChild,
}: FileTreeItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const paddingLeft = 20 + level * 16;

  const { t } = useLocalization();

  return (
    <div className='file-tree-item'>
      <div
        className={`group relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 transition-all duration-200 ${
          isSelected
            ? 'bg-primary dark:bg-dark-primary text-white'
            : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        style={{
          paddingLeft: `${paddingLeft}px`,
          paddingRight: '12px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onItemClick(item)}
      >
        {item.type === 'layout' && (
          <div className='flex h-4 w-4 flex-shrink-0 items-center justify-center'>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
              )
            ) : (
              <div className='h-4 w-4' />
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

        <span className='flex-1 truncate text-sm font-medium'>
          {item.title}
        </span>

        <div className='flex items-center gap-1'>
          {item.type === 'layout' && (
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onCreateNote(item.id);
              }}
              className={`opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                isSelected
                  ? 'text-white hover:text-gray-200'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title='Создать заметку'
            >
              <Plus className='h-4 w-4' />
            </button>
          )}

          {item.type === 'note' && (
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onDeleteNote?.(item.id);
              }}
              className={`transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              title={t('common:deleteNote.deleteBtnTitle')}
            >
              <Trash2 className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && childrenItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            {childrenItems.map(child => renderChild?.(child, level + 1))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
