import { Controls, useReactFlow } from 'reactflow';

export const GraphControls = () => {
  const { fitView } = useReactFlow();

  const handleFitView = () => {
    fitView({
      duration: 800,
      padding: 0.1,
    });
  };

  return <Controls onFitView={handleFitView} />;
};
