import type { UseGraphHistoryReturn } from '@/entities/graph';
import { cn } from '@/shared/lib/core';
import { Tooltip } from '@/shared/ui';
import { Redo2, Undo2 } from 'lucide-react';
import { type FC, useEffect } from 'react';

interface GraphUndoRedoControlsProps {
  graphHistory: UseGraphHistoryReturn;
  isHorizontal?: boolean;
}

export const GraphUndoRedoControls: FC<GraphUndoRedoControlsProps> = ({
  graphHistory,
  isHorizontal = false,
}) => {
  const { undo, redo, canUndo, canRedo, undoDescription, redoDescription } =
    graphHistory;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const code = event.code;
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (isCtrlOrCmd && !event.shiftKey && code === 'KeyZ') {
        event.preventDefault();
        event.stopPropagation();
        if (canUndo) {
          undo();
        }
        return;
      }

      if (
        isCtrlOrCmd &&
        (code === 'KeyY' || (event.shiftKey && code === 'KeyZ'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (canRedo) {
          redo();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [undo, redo, canUndo, canRedo]);

  const direction = isHorizontal ? 'row' : 'column';

  return (
    <div
      className={cn(
        'flex gap-1',
        direction === 'row' ? 'flex-row' : 'flex-col'
      )}
    >
      <Tooltip
        title={`Undo${undoDescription ? `: ${undoDescription}` : ''} (Ctrl+Z)`}
        placement={isHorizontal ? 'bottom' : 'right'}
      >
        <button
          type='button'
          onClick={undo}
          disabled={!canUndo}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            canUndo
              ? 'text-primary hover:bg-primary/15 dark:text-dark-primary dark:hover:bg-dark-primary/15'
              : 'text-secondary/60 dark:text-dark-secondary/60 cursor-not-allowed'
          )}
          aria-label='Undo'
        >
          <Undo2 size={16} />
        </button>
      </Tooltip>

      <Tooltip
        title={`Redo${redoDescription ? `: ${redoDescription}` : ''} (Ctrl+Y)`}
        placement={isHorizontal ? 'bottom' : 'right'}
      >
        <button
          type='button'
          onClick={redo}
          disabled={!canRedo}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            canRedo
              ? 'text-primary hover:bg-primary/15 dark:text-dark-primary dark:hover:bg-dark-primary/15'
              : 'text-secondary/60 dark:text-dark-secondary/60 cursor-not-allowed'
          )}
          aria-label='Redo'
        >
          <Redo2 size={16} />
        </button>
      </Tooltip>
    </div>
  );
};
