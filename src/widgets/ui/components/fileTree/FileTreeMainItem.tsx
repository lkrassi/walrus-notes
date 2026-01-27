import { Network } from 'lucide-react';
import { cn } from 'shared/lib/cn';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';

type Props = {
  item: FileTreeItemType;
  level?: number;
  isSelected?: boolean;
  hasSelection?: boolean;
  onItemClick?: (item: FileTreeItemType) => void;
};

export const FileTreeMainItem: React.FC<Props> = ({
  item,
  level = 0,
  isSelected,
  hasSelection,
  onItemClick,
}) => {
  const paddingLeft = 20 + level * 16;

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
        'text-text',
        isSelected
          ? 'text-text dark:text-dark-text'
          : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
      style={{
        paddingLeft: `${paddingLeft}px`,
        paddingRight: '12px',
        ...(isSelected && item.color && !item.isMain
          ? { boxShadow: `0 0 0 2px ${item.color}` }
          : {}),
        ...(hasSelection && !isSelected && item.type === 'layout'
          ? { opacity: 0.5 }
          : {}),
      }}
      onClick={() => onItemClick?.(item)}
    >
      <div
        className={cn('h-4', 'w-4', 'flex', 'items-center', 'justify-center')}
      >
        <Network className={cn('h-4', 'w-4')} />
      </div>

      <span
        className={cn(
          'flex-1',
          'truncate',
          'text-sm',
          'font-medium',
          'text-text',
          'dark:text-dark-text'
        )}
      >
        {item.title}
      </span>

      <div className={cn('flex', 'items-center', 'gap-1')}></div>
    </div>
  );
};
