export interface MultiColorStepEdgeData {
  isRelatedToSelected?: boolean;
  isSelected?: boolean;
  edgeColor?: string;
  isBidirectional?: boolean;
  reverseEdgeColor?: string;
}
export type {
  EdgeDeleteEventDetail,
  EdgeDeleteHoverEventDetail,
} from '../../../model/types';

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
