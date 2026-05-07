import type { UseGraphHistoryReturn } from '@/entities/graph';
import { cn } from '@/shared/lib/core';
import { IconButton, Tooltip } from '@/shared/ui';
import { Redo2, Undo2 } from 'lucide-react';
import { type FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface GraphUndoRedoControlsProps {
  graphHistory: UseGraphHistoryReturn;
  isHorizontal?: boolean;
}

export const GraphUndoRedoControls: FC<GraphUndoRedoControlsProps> = ({
  graphHistory,
  isHorizontal = false,
}) => {
  const { t } = useTranslation('main');
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
  const undoTitle = t('undoRedo.undo', {
    description: undoDescription ? `: ${undoDescription}` : '',
  });
  const redoTitle = t('undoRedo.redo', {
    description: redoDescription ? `: ${redoDescription}` : '',
  });

  return (
    <div
      className={cn(
        'flex gap-1',
        direction === 'row' ? 'flex-row' : 'flex-col'
      )}
    >
      <Tooltip title={undoTitle} placement={isHorizontal ? 'bottom' : 'right'}>
        <IconButton
          size='md'
          variant='outline'
          onClick={undo}
          disabled={!canUndo}
          icon={<Undo2 size={16} />}
          className={cn(
            'border-border/70 rounded-lg',
            canUndo
              ? 'text-primary hover:bg-primary/15 dark:text-dark-primary dark:hover:bg-dark-primary/15'
              : 'text-secondary/60 dark:text-dark-secondary/60 cursor-not-allowed'
          )}
          aria-label={undoTitle}
        />
      </Tooltip>

      <Tooltip title={redoTitle} placement={isHorizontal ? 'bottom' : 'right'}>
        <IconButton
          size='md'
          variant='outline'
          onClick={redo}
          disabled={!canRedo}
          icon={<Redo2 size={16} />}
          className={cn(
            'border-border/70 rounded-lg',
            canRedo
              ? 'text-primary hover:bg-primary/15 dark:text-dark-primary dark:hover:bg-dark-primary/15'
              : 'text-secondary/60 dark:text-dark-secondary/60 cursor-not-allowed'
          )}
          aria-label={redoTitle}
        />
      </Tooltip>
    </div>
  );
};
