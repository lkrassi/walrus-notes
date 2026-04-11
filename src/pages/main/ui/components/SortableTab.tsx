import { cn } from '@/shared/lib/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { FileText, Folder, Network, X } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useTabMiddleClickClose } from '../../lib/hooks';
import type { TabsProps } from '../../model/types/tabsProps';

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
        'group',
        'relative',
        'flex',
        'h-9',
        'max-w-64',
        'min-w-36',
        'cursor-grab',
        'items-center',
        'rounded-lg',
        'px-3',
        'whitespace-nowrap',
        'select-none'
      )}
      title={tab.item.title}
      animate={{
        color: isActive ? 'rgb(255, 255, 255)' : undefined,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      {...attributes}
      {...listeners}
    >
      {showAnimatedBackground && (
        <motion.div
          layoutId='activeTabBackground'
          className='bg-primary absolute inset-0 rounded-lg'
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <div
        className={cn(
          'relative',
          'z-10',
          'mr-1',
          'flex',
          'min-w-0',
          'flex-1',
          'items-center',
          'overflow-hidden',
          isActive ? 'text-primary-foreground' : 'text-foreground'
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
          <div
            className={cn(
              'truncate text-sm font-medium',
              !tab.isPinned && 'italic opacity-90'
            )}
          >
            {tab.item.title}
          </div>
        </div>
      </div>

      <button
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={`Close tab ${tab.item.title}`}
        title={`Close tab ${tab.item.title}`}
        className={cn(
          'relative',
          'z-10',
          'inline-flex',
          'h-6',
          'w-6',
          'items-center',
          'justify-center',
          'rounded-md',
          'transition-colors',
          isActive
            ? 'text-primary-foreground hover:bg-interactive-hover/80'
            : 'text-muted-foreground hover:bg-interactive-hover hover:text-foreground'
        )}
      >
        <X className='h-3.5 w-3.5' />
      </button>
    </motion.div>
  );
};
