import React, { useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { Undo as UndoIcon, Redo as RedoIcon } from '@mui/icons-material';
import type { UseGraphHistoryReturn } from '../../model/hooks/useGraphHistory';

interface GraphUndoRedoControlsProps {
  graphHistory: UseGraphHistoryReturn;
  isHorizontal?: boolean;
}

/**
 * Undo/Redo controls component for graph editor
 * Includes keyboard shortcuts (Ctrl+Z for undo, Ctrl+Y for redo)
 */
export const GraphUndoRedoControls: React.FC<GraphUndoRedoControlsProps> = ({
  graphHistory,
  isHorizontal = false,
}) => {
  const { undo, redo, canUndo, canRedo, undoDescription, redoDescription } =
    graphHistory;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const code = event.code; // layout-agnostic (e.g., 'KeyZ', 'KeyY')
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+Z or Cmd+Z for undo (use event.code to handle any keyboard layout)
      if (isCtrlOrCmd && !event.shiftKey && code === 'KeyZ') {
        event.preventDefault();
        event.stopPropagation();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Ctrl+Y or Cmd+Shift+Z for redo (use event.code)
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
