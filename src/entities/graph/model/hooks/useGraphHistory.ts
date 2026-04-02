import { CommandHistory, type Command } from '@/shared/model/command';
import { useCallback, useMemo, useState } from 'react';

export interface UseGraphHistoryReturn {
  executeCommand: (command: Command) => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoDescription: string | null;
  redoDescription: string | null;
  clear: () => void;
}

export const useGraphHistory = (
  layoutId: string,
  maxHistorySize = 100
): UseGraphHistoryReturn => {
  const history = useMemo(
    () => new CommandHistory(maxHistorySize),
    [layoutId, maxHistorySize]
  );

  const [, forceUpdate] = useState({});
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  const executeCommand = useCallback(
    async (command: Command) => {
      await history.execute(command);
      triggerUpdate();
    },
    [history, triggerUpdate]
  );

  const undo = useCallback(() => {
    history.undo();
    triggerUpdate();
  }, [history, triggerUpdate]);

  const redo = useCallback(() => {
    history.redo();
    triggerUpdate();
  }, [history, triggerUpdate]);

  const clear = useCallback(() => {
    history.clear();
    triggerUpdate();
  }, [history, triggerUpdate]);

  return {
    executeCommand,
    undo,
    redo,
    canUndo: history.canUndo(),
    canRedo: history.canRedo(),
    undoDescription: history.getUndoDescription(),
    redoDescription: history.getRedoDescription(),
    clear,
  };
};
