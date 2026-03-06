import { useTabMiddleClickClose } from '@/features/main/hooks/useTabMiddleClickClose';
import type { TabsProps } from '@/features/main/model/types/tabsProps';
import { cn } from '@/shared/lib';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { FileText, Folder, Network, X } from 'lucide-react';
import type { MouseEvent } from 'react';

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
    opacity: isDragging ? 0 : 1,
    flexShrink: 0,
    position: 'relative' as const,
  };

  const handleContentClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onClick();
  };

  const handleMiddleClick = useTabMiddleClickClose(onClose);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex max-w-50 min-w-30 cursor-grab items-center px-4 py-2 whitespace-nowrap select-none'
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
          'relative z-10 mr-2 flex min-w-0 flex-1 items-center overflow-hidden',
          isActive
            ? 'dark:text-dark-text text-white'
            : 'text-text dark:text-dark-text'
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
