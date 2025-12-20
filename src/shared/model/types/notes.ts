import type { Note } from './layouts';

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
