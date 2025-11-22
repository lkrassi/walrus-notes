import { ReactFlowProvider } from 'reactflow';
import { NotesGraphContent } from './NotesGraphContent';

interface NotesGraphProps {
  layoutId: string;
  onNoteOpen?: (noteData: {
    noteId: string;
    note: import('shared/model/types/layouts').Note;
  }) => void;
}

export const NotesGraph = ({ layoutId, onNoteOpen }: NotesGraphProps) => {
  return (
    <>
      <ReactFlowProvider>
        <NotesGraphContent layoutId={layoutId} onNoteOpen={onNoteOpen} />
      </ReactFlowProvider>
    </>
  );
};
