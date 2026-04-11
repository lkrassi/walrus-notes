import type { UseGraphHistoryReturn } from '@/entities/graph';
import type { Note } from '@/entities/note';
import type { DragEvent as ReactDragEvent } from 'react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Edge, Node, ReactFlowProps } from 'reactflow';

export type GraphRetractLineState = {
  id: string;
  sourceX: number;
  sourceY: number;
  startX: number;
  startY: number;
  color: string;
  durationMs?: number;
};

type GraphState = {
  layoutId: string;
  isRefreshing: boolean;
  nodesWithSelection: Node[];
  edgesWithSelection: Edge[];
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  disableZoomDuringDrag: boolean;
  allowNodeDrag: boolean;
  isDraggingEdge: boolean;
  retractLine: GraphRetractLineState | null;
  isMain?: boolean;
  graphHistory?: UseGraphHistoryReturn;
  canEdit: boolean;
  onNoteOpenPinned?: (noteData: { noteId: string; note: Note }) => void;
};

type GraphActions = {
  onNodesChange: ReactFlowProps['onNodesChange'];
  onEdgesChange: ReactFlowProps['onEdgesChange'];
  onConnect?: ReactFlowProps['onConnect'];
  onConnectStart?: ReactFlowProps['onConnectStart'];
  onConnectEnd?: ReactFlowProps['onConnectEnd'];
  onNodeDragStart?: ReactFlowProps['onNodeDragStart'];
  onNodeDragStop: NonNullable<ReactFlowProps['onNodeDragStop']>;
  onNodeClick: ReactFlowProps['onNodeClick'];
  onNodeMouseEnter: ReactFlowProps['onNodeMouseEnter'];
  onNodeMouseLeave: ReactFlowProps['onNodeMouseLeave'];
  onPaneClick: ReactFlowProps['onPaneClick'];
  onNodeDoubleClick: ReactFlowProps['onNodeDoubleClick'];
  onDrop: (event: ReactDragEvent) => void;
  onAddNoteToGraph: (note: Note, position?: { x: number; y: number }) => void;
};

const GraphStateContext = createContext<GraphState | null>(null);
const GraphActionsContext = createContext<GraphActions | null>(null);

interface GraphProviderProps {
  state: GraphState;
  actions: GraphActions;
  children: ReactNode;
}

export const GraphProvider = ({
  state,
  actions,
  children,
}: GraphProviderProps) => {
  const stateValue = useMemo(() => state, [state]);
  const actionsValue = useMemo(() => actions, [actions]);

  return (
    <GraphStateContext.Provider value={stateValue}>
      <GraphActionsContext.Provider value={actionsValue}>
        {children}
      </GraphActionsContext.Provider>
    </GraphStateContext.Provider>
  );
};

export const useGraphContextState = () => {
  const context = useContext(GraphStateContext);
  if (!context) {
    throw new Error('useGraphContextState must be used within GraphProvider');
  }
  return context;
};

export const useGraphContextActions = () => {
  const context = useContext(GraphActionsContext);
  if (!context) {
    throw new Error('useGraphContextActions must be used within GraphProvider');
  }
  return context;
};
