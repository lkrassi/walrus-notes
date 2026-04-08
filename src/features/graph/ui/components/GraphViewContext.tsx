import { createContext, useContext, type FC, type ReactNode } from 'react';
import type { ReactFlowProps } from 'reactflow';

type GraphViewContextValue = {
  onNodeDragStop: ReactFlowProps['onNodeDragStop'];
  onNodeDrag: ReactFlowProps['onNodeDrag'];
  onNodeContextMenu?: ReactFlowProps['onNodeContextMenu'];
  onPaneClick?: ReactFlowProps['onPaneClick'];
  ViewportTracker: FC<{
    onViewportChange: (c: { x: number; y: number } | null) => void;
  }>;
  onViewportChange: (c: { x: number; y: number } | null) => void;
  minimapOffset?: string;
};

const GraphViewContext = createContext<GraphViewContextValue | null>(null);

export const GraphViewProvider = ({
  value,
  children,
}: {
  value: GraphViewContextValue;
  children: ReactNode;
}) => {
  return (
    <GraphViewContext.Provider value={value}>
      {children}
    </GraphViewContext.Provider>
  );
};

export const useGraphViewContext = () => {
  const context = useContext(GraphViewContext);
  if (!context) {
    throw new Error(
      'useGraphViewContext must be used within GraphViewProvider'
    );
  }
  return context;
};
