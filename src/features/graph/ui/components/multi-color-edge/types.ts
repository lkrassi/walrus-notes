export interface MultiColorStepEdgeData {
  isRelatedToSelected?: boolean;
  isSelected?: boolean;
  edgeColor?: string;
}

export interface EdgeDeleteEventDetail {
  edgeId: string;
  source: string;
  target: string;
  newTarget?: string | null;
}

export interface NodeFlowInfo {
  center: { x: number; y: number };
  anchors: {
    top: { x: number; y: number };
    right: { x: number; y: number };
    bottom: { x: number; y: number };
    left: { x: number; y: number };
  };
}

export interface EdgeDragState {
  isDragging: boolean;
  dragPosition: { x: number; y: number } | null;
  currentTargetNode: string | null;
}

export interface EdgeColors {
  stroke: string;
  valid: string;
  invalid: string;
}
