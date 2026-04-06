import type { Note } from '@/entities/note';
import { ReactFlowProvider } from 'reactflow';
import { NotesGraphContent } from './NotesGraphContent';

interface NotesGraphProps {
  layoutId: string;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  onNoteOpenPinned?: (noteData: { noteId: string; note: Note }) => void;
  allowNodeDrag?: boolean;
  isMain?: boolean;
}

export const NotesGraph = ({
  layoutId,
  onNoteOpen,
  onNoteOpenPinned,
  allowNodeDrag,
  isMain,
}: NotesGraphProps) => {
  return (
    <>
      <ReactFlowProvider>
        <NotesGraphContent
          layoutId={layoutId}
          onNoteOpen={onNoteOpen}
          onNoteOpenPinned={onNoteOpenPinned}
          allowNodeDrag={allowNodeDrag}
          isMain={isMain}
        />
      </ReactFlowProvider>
    </>
  );
};
