import { FileText, Folder, X, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTabMiddleClickClose } from '../../hooks/useTabMiddleClickClose';
import cn from 'shared/lib/cn';
import type { TabsProps } from '../../model/types/tabsProps';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableTab = ({
  tab,
  isActive,
  onClose,
  onClick,
  showAnimatedBackground,
}: {
  tab: TabsProps['tabs'][number];
  isActive: boolean;
  onClose: () => void;
  onClick: () => void;
  showAnimatedBackground?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging
      ? '0 10px 25px rgba(0, 0, 0, 0.15)'
      : '0 1px 3px rgba(0, 0, 0, 0.1)',
    flexShrink: 0,
    position: 'relative' as const,
  };

  const handleContentClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onClick();
  };

  const handleMiddleClick = useTabMiddleClickClose(onClose);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex max-w-[200px] min-w-[120px] cursor-grab items-center px-4 py-2 whitespace-nowrap select-none',
        isActive
          ? 'z-10 rounded-t-lg text-white shadow-md'
          : 'text-text dark:text-dark-text mx-0.5 rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-700/50'
      )}
      title={tab.item.title}
      animate={{
        color: isActive ? 'rgb(255, 255, 255)' : undefined,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      {...attributes}
      {...listeners}
    >
      {showAnimatedBackground && (
        <motion.div
          layoutId='activeTabBackground'
          className='bg-primary absolute inset-0 rounded-t-lg'
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <div
        className={cn(
          'relative z-10 mr-2 flex min-w-0 flex-1 items-center overflow-hidden'
        )}
        onClick={handleContentClick}
        onMouseDown={handleMiddleClick}
      >
        {tab.item.type === 'note' ? (
          <FileText className='mr-2 h-4 w-4' />
        ) : tab.item.isMain === true ? (
          <Network className='mr-2 h-4 w-4' />
        ) : (
          <Folder className='mr-2 h-4 w-4' />
        )}
        <div className='min-w-0 flex-1 overflow-hidden'>
          <div className='truncate text-sm font-medium'>{tab.item.title}</div>
        </div>
      </div>

      <button
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        className={cn(
          'relative z-10 ml-2',
          isActive ? 'text-white' : 'text-text dark:text-dark-text'
        )}
      >
        <X
          className={cn(
            isActive ? 'hover:bg-white hover:text-black' : 'hover:bg-primary',
            'h-3 w-3 rounded-xl'
          )}
        />
      </button>
    </motion.div>
  );
};
