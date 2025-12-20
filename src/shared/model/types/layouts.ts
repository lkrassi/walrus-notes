export interface Note {
  id: string;
  title: string;
  isMain: boolean;
  payload: string;
  ownerId: string;
  layoutId?: string;
  haveAccess: string[];
  position?: {
    xPos: number;
    yPos: number;
  };
  linkedWith?: string[];
  draft?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Layout {
  id: string;
  title: string;
  ownerId: string;
  isMain: boolean;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EdgeDeleteEventDetail {
  edgeId: string;
  source: string;
  target: string;
  newTarget?: string | null;
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
