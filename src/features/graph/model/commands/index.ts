import type { Command } from 'shared/model/command';
import type { Node, Edge } from 'reactflow';


export class MoveNodeCommand implements Command {
  private nodeId: string;
  private previousPosition: { x: number; y: number };
  private newPosition: { x: number; y: number };
  private onExecute: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;

  constructor(
    nodeId: string,
    previousPosition: { x: number; y: number },
    newPosition: { x: number; y: number },
    onExecute: (nodeId: string, position: { x: number; y: number }) => void
  ) {
    this.nodeId = nodeId;
    this.previousPosition = previousPosition;
    this.newPosition = newPosition;
    this.onExecute = onExecute;
  }

  async execute(): Promise<void> {
    this.onExecute(this.nodeId, this.newPosition);
  }

  async undo(): Promise<void> {
    this.onExecute(this.nodeId, this.previousPosition);
  }

  getDescription(): string {
    return `Move note to (${Math.round(this.newPosition.x)}, ${Math.round(this.newPosition.y)})`;
  }
}


export class CreateEdgeCommand implements Command {
  private edge: Edge;
  private onExecute: (edge: Edge) => Promise<void> | void;
  private onUndo: (edgeId: string) => Promise<void> | void;

  constructor(
    edge: Edge,
    onExecute: (edge: Edge) => Promise<void> | void,
    onUndo: (edgeId: string) => Promise<void> | void
  ) {
    this.edge = edge;
    this.onExecute = onExecute;
    this.onUndo = onUndo;
  }

  async execute(): Promise<void> {
    await this.onExecute(this.edge);
  }

  async undo(): Promise<void> {
    await this.onUndo(this.edge.id);
  }

  getDescription(): string {
    return `Connect notes`;
  }
}

export class DeleteEdgeCommand implements Command {
  private edge: Edge;
  private onExecute: (edgeId: string) => Promise<void> | void;
  private onUndo: (edge: Edge) => Promise<void> | void;

  constructor(
    edge: Edge,
    onExecute: (edgeId: string) => Promise<void> | void,
    onUndo: (edge: Edge) => Promise<void> | void
  ) {
    this.edge = edge;
    this.onExecute = onExecute;
    this.onUndo = onUndo;
  }

  async execute(): Promise<void> {
    await this.onExecute(this.edge.id);
  }

  async undo(): Promise<void> {
    await this.onUndo(this.edge);
  }

  getDescription(): string {
    return `Disconnect notes`;
  }
}


export class MoveEdgeCommand implements Command {
  private edgeId: string;
  private oldTarget: string;
  private newTarget: string;
  private source: string;
  private onExecute: (
    edgeId: string,
    source: string,
    oldTarget: string,
    newTarget: string
  ) => Promise<void> | void;

  constructor(
    edgeId: string,
    source: string,
    oldTarget: string,
    newTarget: string,
    onExecute: (
      edgeId: string,
      source: string,
      oldTarget: string,
      newTarget: string
    ) => Promise<void> | void
  ) {
    this.edgeId = edgeId;
    this.source = source;
    this.oldTarget = oldTarget;
    this.newTarget = newTarget;
    this.onExecute = onExecute;
  }

  async execute(): Promise<void> {
    await this.onExecute(
      this.edgeId,
      this.source,
      this.oldTarget,
      this.newTarget
    );
  }

  async undo(): Promise<void> {
    await this.onExecute(
      this.edgeId,
      this.source,
      this.newTarget,
      this.oldTarget
    );
  }

  getDescription(): string {
    return `Move connection to different note`;
  }
}
