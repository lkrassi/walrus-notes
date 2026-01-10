/**
 * Command pattern for implementing undo/redo functionality.
 * All operations that should support undo/redo must implement this interface.
 */

export interface Command {
  /** Execute the command */
  execute(): Promise<void> | void;

  /** Undo the command (revert to previous state) */
  undo(): Promise<void> | void;

  /** Get a human-readable description of the command for UI */
  getDescription(): string;
}

/**
 * History manager for handling undo/redo operations.
 * Uses a stack-based approach with separate undo and redo stacks.
 */
export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize: number = 100;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Execute a command and add it to the undo stack
   */
  async execute(command: Command): Promise<void> {
    await command.execute();
    this.undoStack.push(command);

    // Clear redo stack when a new command is executed
    this.redoStack = [];

    // Trim undo stack if it exceeds max size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  /**
   * Undo the last command
   */
  async undo(): Promise<void> {
    const command = this.undoStack.pop();
    if (!command) return;

    await command.undo();
    this.redoStack.push(command);
  }

  /**
   * Redo the last undone command
   */
  async redo(): Promise<void> {
    const command = this.redoStack.pop();
    if (!command) return;

    await command.execute();
    this.undoStack.push(command);
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get the description of the command that will be undone
   */
  getUndoDescription(): string | null {
    const command = this.undoStack[this.undoStack.length - 1];
    return command?.getDescription() ?? null;
  }

  /**
   * Get the description of the command that will be redone
   */
  getRedoDescription(): string | null {
    const command = this.redoStack[this.redoStack.length - 1];
    return command?.getDescription() ?? null;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get current undo stack size (for debugging)
   */
  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Get current redo stack size (for debugging)
   */
  getRedoStackSize(): number {
    return this.redoStack.length;
  }
}
