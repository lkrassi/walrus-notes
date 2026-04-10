import type { Command } from '@/shared/model/command';
import type { Edge } from 'reactflow';

type NodePosition = { x: number; y: number };

type MoveNodeCommandParams = {
  nodeId: string;
  previousPosition: NodePosition;
  newPosition: NodePosition;
  description: string;
  onExecute: (nodeId: string, position: NodePosition) => Promise<void> | void;
};

export const createMoveNodeCommand = ({
  nodeId,
  previousPosition,
  newPosition,
  description,
  onExecute,
}: MoveNodeCommandParams): Command => ({
  execute: async () => {
    await onExecute(nodeId, newPosition);
  },
  undo: async () => {
    await onExecute(nodeId, previousPosition);
  },
  getDescription: () => description,
});

type CreateEdgeCommandParams = {
  edge: Edge;
  description: string;
  onExecute: (edge: Edge) => Promise<void> | void;
  onUndo: (edgeId: string) => Promise<void> | void;
};

export const createEdgeCommand = ({
  edge,
  description,
  onExecute,
  onUndo,
}: CreateEdgeCommandParams): Command => ({
  execute: async () => {
    await onExecute(edge);
  },
  undo: async () => {
    await onUndo(edge.id);
  },
  getDescription: () => description,
});

type DeleteEdgeCommandParams = {
  edge: Edge;
  description: string;
  onExecute: (edgeId: string) => Promise<void> | void;
  onUndo: (edge: Edge) => Promise<void> | void;
};

export const createDeleteEdgeCommand = ({
  edge,
  description,
  onExecute,
  onUndo,
}: DeleteEdgeCommandParams): Command => ({
  execute: async () => {
    await onExecute(edge.id);
  },
  undo: async () => {
    await onUndo(edge);
  },
  getDescription: () => description,
});

type MoveEdgeCommandParams = {
  edgeId: string;
  source: string;
  oldTarget: string;
  newTarget: string;
  description: string;
  onExecute: (
    edgeId: string,
    source: string,
    oldTarget: string,
    newTarget: string
  ) => Promise<void> | void;
};

export const createMoveEdgeCommand = ({
  edgeId,
  source,
  oldTarget,
  newTarget,
  description,
  onExecute,
}: MoveEdgeCommandParams): Command => ({
  execute: async () => {
    await onExecute(edgeId, source, oldTarget, newTarget);
  },
  undo: async () => {
    await onExecute(edgeId, source, newTarget, oldTarget);
  },
  getDescription: () => description,
});
