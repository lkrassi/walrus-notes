import { cn } from '@/shared/lib/core';
import { Eye, Trash2 } from 'lucide-react';
import type { FC, MouseEvent as ReactMouseEvent } from 'react';

interface GraphNodeContextMenuProps {
  contextMenu: { x: number; y: number } | null;
  canEdit: boolean;
  openLabel: string;
  deleteLabel: string;
  onOpen: () => void;
  onDelete: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

export const GraphNodeContextMenu: FC<GraphNodeContextMenuProps> = ({
  contextMenu,
  canEdit,
  openLabel,
  deleteLabel,
  onOpen,
  onDelete,
}) => {
  if (!contextMenu) {
    return null;
  }

  return (
    <div
      data-graph-node-context-menu='true'
      role='menu'
      className={cn(
        'w-40',
        'border-border',
        'dark:border-dark-border',
        'bg-bg',
        'dark:bg-dark-bg',
        'text-text',
        'dark:text-dark-text',
        'border',
        'fixed z-50 w-48 border'
      )}
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      <button
        role='menuitem'
        type='button'
        onClick={onOpen}
        className={cn(
          'hover:bg-muted-foreground/10 flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors'
        )}
        title={openLabel}
      >
        <Eye className='h-3.5 w-3.5' />
        <span>{openLabel}</span>
      </button>

      {canEdit && (
        <button
          role='menuitem'
          type='button'
          onClick={onDelete}
          className={cn(
            'hover:bg-muted-foreground/10 text-danger flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors'
          )}
          title={deleteLabel}
        >
          <Trash2 className='h-3.5 w-3.5' />
          <span>{deleteLabel}</span>
        </button>
      )}
    </div>
  );
};
