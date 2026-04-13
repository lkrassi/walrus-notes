import type { Note } from '@/entities/note';

export interface EdgeDeleteEventDetail {
  edgeId: string;
  source: string;
  target: string;
  newTarget?: string | null;
  dropFlowX?: number;
  dropFlowY?: number;
}

export interface EdgeDeleteHoverEventDetail {
  edgeId: string;
  source: string;
  target: string;
  hoveredTarget?: string | null;
}

export interface NoteNodeData {
  note: Note;
  onNoteClick?: (noteId: string) => void;
  isSelected?: boolean;
  isHovered?: boolean;
}

export interface MultiColorEdgeData {
  sourceColor: string;
  targetColor: string;
}

export interface GraphNode {
  id: string;
  type: 'note';
  position: { x: number; y: number };
  data: {
    note: Note;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'default';
}

declare module 'reactflow' {
  interface NodeData {
    note?: Note;
    onNoteClick?: (noteId: string) => void;
    isSelected?: boolean;
    isHovered?: boolean;
    layoutColor?: string;
  }

  interface EdgeData {
    sourceColor?: string;
    targetColor?: string;
  }
}
