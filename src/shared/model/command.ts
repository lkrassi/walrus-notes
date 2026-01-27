export interface Command {
  execute(): Promise<void> | void;

  undo(): Promise<void> | void;

  getDescription(): string;
}

export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize: number = 100;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  async execute(command: Command): Promise<void> {
    await command.execute();
    this.undoStack.push(command);

    this.redoStack = [];

    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  async undo(): Promise<void> {
    const command = this.undoStack.pop();
    if (!command) return;

    await command.undo();
    this.redoStack.push(command);
  }

  async redo(): Promise<void> {
    const command = this.redoStack.pop();
    if (!command) return;

    await command.execute();
    this.undoStack.push(command);
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getUndoDescription(): string | null {
    const command = this.undoStack[this.undoStack.length - 1];
    return command?.getDescription() ?? null;
  }

  getRedoDescription(): string | null {
    const command = this.redoStack[this.redoStack.length - 1];
    return command?.getDescription() ?? null;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  getRedoStackSize(): number {
    return this.redoStack.length;
  }
}
