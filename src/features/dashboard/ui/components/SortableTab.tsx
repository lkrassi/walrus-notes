import { FileText, Folder, X, Network } from 'lucide-react';
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
}: {
  tab: TabsProps['tabs'][number];
  isActive: boolean;
  onClose: () => void;
  onClick: () => void;
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-border dark:border-dark-border relative flex max-w-[200px] min-w-[120px] cursor-grab items-center border-r px-4 py-2 whitespace-nowrap select-none',
        isActive
          ? 'bg-primary border-b-primary border-b-2 text-white'
          : 'text-text dark:text-dark-text bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
      )}
      title={tab.item.title}
      {...attributes}
      {...listeners}
    >
      <div
        className={cn('mr-2 flex min-w-0 flex-1 items-center overflow-hidden')}
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
          'ml-2',
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
    </div>
  );
};
