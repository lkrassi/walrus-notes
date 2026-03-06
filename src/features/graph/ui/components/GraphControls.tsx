import type { UseGraphHistoryReturn } from '@/entities/graph/model';
import { type FC } from 'react';
import { Controls, Panel, useReactFlow } from 'reactflow';
import { GraphUndoRedoControls } from './GraphUndoRedoControls';

interface GraphControlsProps {
  graphHistory?: UseGraphHistoryReturn;
}

export const GraphControls: FC<GraphControlsProps> = ({ graphHistory }) => {
  const { fitView } = useReactFlow();

  const handleFitView = () => {
    fitView({
      duration: 800,
      padding: 0.1,
    });
  };

  return (
    <>
      <Controls onFitView={handleFitView} />
      {graphHistory && (
        <Panel position='top-left' style={{ marginTop: '50px' }}>
          <GraphUndoRedoControls graphHistory={graphHistory} isHorizontal />
        </Panel>
      )}
    </>
  );
};
