import { ReactFlowProvider } from 'reactflow';
import { NotesGraphContent } from './NotesGraphContent';

interface NotesGraphProps {
  layoutId: string;
}

export const NotesGraph = ({
  layoutId,
}: NotesGraphProps) => {
  return (
    <ReactFlowProvider>
      <NotesGraphContent
        layoutId={layoutId}
      />
    </ReactFlowProvider>
  );
};
