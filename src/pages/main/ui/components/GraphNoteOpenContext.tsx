import type { Note } from '@/entities/note';
import { createContext, useContext, type ReactNode } from 'react';

type NoteOpenHandler = (noteData: { noteId: string; note: Note }) => void;

type GraphNoteOpenContextValue = {
  onNoteOpen: NoteOpenHandler;
  onNoteOpenPinned: NoteOpenHandler;
};

const GraphNoteOpenContext = createContext<GraphNoteOpenContextValue | null>(
  null
);

export const GraphNoteOpenProvider = ({
  value,
  children,
}: {
  value: GraphNoteOpenContextValue;
  children: ReactNode;
}) => {
  return (
    <GraphNoteOpenContext.Provider value={value}>
      {children}
    </GraphNoteOpenContext.Provider>
  );
};

export const useGraphNoteOpenContext = () => {
  const context = useContext(GraphNoteOpenContext);
  if (!context) {
    throw new Error(
      'useGraphNoteOpenContext must be used within GraphNoteOpenProvider'
    );
  }
  return context;
};
