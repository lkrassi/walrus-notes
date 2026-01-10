import React from 'react';
import { Controls, useReactFlow, Panel } from 'reactflow';
import type { UseGraphHistoryReturn } from '../../model/hooks/useGraphHistory';
import { GraphUndoRedoControls } from './GraphUndoRedoControls';

interface GraphControlsProps {
  graphHistory?: UseGraphHistoryReturn;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  graphHistory,
}) => {
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
