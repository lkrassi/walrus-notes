import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalization } from 'widgets/hooks';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';

interface FileTreeItemProps {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onCreateNote: (layoutId: string) => void;
  childrenItems?: FileTreeItemType[];
  renderChild?: (child: FileTreeItemType, level: number) => React.ReactNode;
}

export const FileTreeItem = ({
  item,
  level,
  isExpanded,
  isSelected,
  hasChildren,
  onItemClick,
  onCreateNote,
  childrenItems,
  renderChild,
}: FileTreeItemProps) => {
  const { t } = useLocalization();
  return (
    <div>
      <div
        className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 ${
          isSelected
            ? 'bg-primary dark:bg-dark-primary text-white'
            : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800'
        } `}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
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

        <div className='flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100'>
          {item.type === 'layout' ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onCreateNote(item.id);
              }}
              className='rounded p-1 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              title={t('fileTree:createNote')}
            >
              <Plus className='h-3 w-3' />
            </button>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
              }}
              className='rounded p-1 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              title={t('fileTree:actions')}
            >
              <MoreHorizontal className='h-3 w-3' />
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
            className="overflow-hidden"
          >
            {childrenItems.map(child => renderChild?.(child, level + 1))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
