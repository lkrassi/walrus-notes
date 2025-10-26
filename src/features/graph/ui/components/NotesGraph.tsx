import { ReactFlowProvider } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';
import { NotesGraphContent } from './NotesGraphContent';

interface NotesGraphProps {
  layoutId: string;
  onNoteDoubleClick?: (note: Note) => void;
}

export const NotesGraph = ({
  layoutId,
  onNoteDoubleClick,
}: NotesGraphProps) => {
  return (
    <ReactFlowProvider>
      <NotesGraphContent
        layoutId={layoutId}
        onNoteDoubleClick={onNoteDoubleClick}
      />
    </ReactFlowProvider>
  );
};
