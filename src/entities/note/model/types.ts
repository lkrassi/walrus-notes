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
  linkedWithIn?: string[];
  linkedWithOut?: string[];
  draft?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotePosition {
  layoutId: string;
  noteId: string;
  xPos: number;
  yPos: number;
}

export interface NoteWithPosition extends Note {
  xPos?: number;
  yPos?: number;
}
