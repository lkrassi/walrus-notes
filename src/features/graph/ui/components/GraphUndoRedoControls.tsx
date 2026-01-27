import { Redo as RedoIcon, Undo as UndoIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useEffect } from 'react';
import type { UseGraphHistoryReturn } from '../../model/hooks/useGraphHistory';

interface GraphUndoRedoControlsProps {
  graphHistory: UseGraphHistoryReturn;
  isHorizontal?: boolean;
}

export const GraphUndoRedoControls: React.FC<GraphUndoRedoControlsProps> = ({
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

  const buttonSize = 'small';
  const direction = isHorizontal ? 'row' : 'column';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: 0.5,
      }}
    >
      <Tooltip
        title={`Undo${undoDescription ? `: ${undoDescription}` : ''} (Ctrl+Z)`}
        placement={isHorizontal ? 'bottom' : 'right'}
      >
        <span>
          <IconButton
            size={buttonSize}
            onClick={undo}
            disabled={!canUndo}
            sx={{
              color: canUndo ? 'primary.main' : 'action.disabled',
              '&:hover': canUndo ? { backgroundColor: 'primary.light' } : {},
            }}
          >
            <UndoIcon fontSize='small' />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={`Redo${redoDescription ? `: ${redoDescription}` : ''} (Ctrl+Y)`}
        placement={isHorizontal ? 'bottom' : 'right'}
      >
        <span>
          <IconButton
            size={buttonSize}
            onClick={redo}
            disabled={!canRedo}
            sx={{
              color: canRedo ? 'primary.main' : 'action.disabled',
              '&:hover': canRedo ? { backgroundColor: 'primary.light' } : {},
            }}
          >
            <RedoIcon fontSize='small' />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};
