import { createMoveNodeCommand, type useGraphHistory } from '@/entities/graph';
import { useCallback, useRef, type MouseEvent, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { Edge, Node, NodeChange } from 'reactflow';

type GraphHistory = ReturnType<typeof useGraphHistory>;

interface UseGraphDragHandlersProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  updatePositionCallback: (
    nodeId: string,
    x: number,
    y: number
  ) => Promise<void>;
  graphHistory: GraphHistory;
  isNodeDraggingRef: RefObject<boolean>;
  isProcessingRef: RefObject<boolean>;
  rfSetNodes?: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node, nodes: Node[]) => void;
  setIsNodeDragging?: (dragging: boolean) => void;
  onNodesChange?: (changes: NodeChange[]) => void;
  rfSetEdges?: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
}

interface NodeExt extends Node {
  selected?: boolean;
  width?: number | null;
  height?: number | null;
}

export const useGraphDragHandlers = ({
  nodes,
  setNodes,
  updatePositionCallback,
  graphHistory,
  isNodeDraggingRef,
  isProcessingRef,
  rfSetNodes,
  onNodeDragStop,
  setIsNodeDragging,
  onNodesChange,
  rfSetEdges,
}: UseGraphDragHandlersProps) => {
  const { t } = useTranslation('main');
  const nodePositionsAtDragStartRef = useRef<
    Map<string, { x: number; y: number }>
  >(new Map());

  const handleNodeDragStart = useCallback(
    (_event: MouseEvent, node: Node) => {
      isNodeDraggingRef.current = true;
      setIsNodeDragging?.(true);

      nodePositionsAtDragStartRef.current = new Map([
        [node.id, { ...node.position }],
      ]);
    },
    [isNodeDraggingRef, setIsNodeDragging]
  );

  const handleNodeDragStop = useCallback(
    (_event: MouseEvent, node: Node, nodesAtStop: Node[] = []) => {
      if (!node) {
        try {
          isNodeDraggingRef.current = false;
          setIsNodeDragging?.(false);
        } catch (e) {
          console.error('Failed to reset node dragging state', e);
        }
        return;
      }

      try {
        const latestNodes =
          Array.isArray(nodesAtStop) && nodesAtStop.length > 0
            ? nodesAtStop
            : nodes;
        isProcessingRef.current = true;

        isNodeDraggingRef.current = false;
        setIsNodeDragging?.(false);
        const startPos = nodePositionsAtDragStartRef.current.get(node.id);
        const currentNode = latestNodes.find(n => n.id === node.id);
        const endPos = currentNode?.position;

        if (!startPos && endPos) {
          void updatePositionCallback(node.id, endPos.x, endPos.y)
            .then(() => undefined)
            .catch(error => {
              console.error('Failed to persist node position', error);
            });
        }

        if (
          startPos &&
          endPos &&
          (startPos.x !== endPos.x || startPos.y !== endPos.y)
        ) {
          const nodeData = node.data as
            | { note?: { title?: string } }
            | undefined;
          const noteTitle = nodeData?.note?.title?.trim() || node.id;

          const command = createMoveNodeCommand({
            nodeId: node.id,
            previousPosition: startPos,
            newPosition: endPos,
            description: t('undoRedo.moveNote', { noteTitle }),
            onExecute: async (
              nodeId: string,
              position: { x: number; y: number }
            ) => {
              setNodes(prev => {
                const updated = prev.map(n =>
                  n.id === nodeId ? { ...n, position } : n
                );
                return updated;
              });
              try {
                rfSetNodes?.(prev =>
                  prev.map(n => (n.id === nodeId ? { ...n, position } : n))
                );
              } catch (e) {
                console.error('Failed to sync React Flow nodes state', e);
              }
              try {
                const change = {
                  id: nodeId,
                  type: 'position',
                  position,
                  dragging: false,
                } as unknown as NodeChange;
                onNodesChange?.([change]);
              } catch (e) {
                console.error('Failed to emit node position change event', e);
              }
              try {
                rfSetEdges?.(prev => prev.map(e => ({ ...e })));
              } catch (e) {
                console.error('Failed to refresh React Flow edges state', e);
              }

              void updatePositionCallback(nodeId, position.x, position.y)
                .then(() => undefined)
                .catch(error => {
                  console.error('Failed to persist node position', error);
                });
            },
          });

          void graphHistory.executeCommand(command).catch(error => {
            console.error('Failed to execute move node command', error);
          });
        }
      } catch (_e) {
        onNodeDragStop?.(_event, node, nodesAtStop);
      }

      isProcessingRef.current = false;
    },
    [
      nodes,
      updatePositionCallback,
      graphHistory,
      isNodeDraggingRef,
      isProcessingRef,
      setIsNodeDragging,
      rfSetNodes,
      onNodeDragStop,
      onNodesChange,
      rfSetEdges,
      setNodes,
      t,
    ]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      type LocalNodeChange = {
        id?: string;
        type?: 'position' | 'select' | string;
        position?: { x: number; y: number } | null;
        selected?: boolean;
        dragging?: boolean;
      };

      const posChanges = (changes as LocalNodeChange[]).filter(
        ch => ch.type === 'position' && ch.position
      );

      if (posChanges.some(ch => ch.dragging !== false)) {
        isNodeDraggingRef.current = true;
        setIsNodeDragging?.(true);
      }

      if (
        posChanges.length > 0 &&
        posChanges.every(ch => ch.dragging === false)
      ) {
        isNodeDraggingRef.current = false;
        setIsNodeDragging?.(false);
      }

      if (posChanges.length === 0) {
        onNodesChange?.(changes);
        return;
      }

      setNodes(prev => {
        const draggingPositionChanges = (changes as LocalNodeChange[]).filter(
          ch => ch.type === 'position' && ch.position && ch.dragging !== false
        );

        if (draggingPositionChanges.length > 0) {
          const prevMapForStart = new Map(prev.map(n => [n.id, n.position]));
          for (const change of draggingPositionChanges) {
            if (!change.id) continue;
            if (nodePositionsAtDragStartRef.current.has(change.id)) continue;

            const startPosition = prevMapForStart.get(change.id);
            if (!startPosition) continue;

            nodePositionsAtDragStartRef.current.set(change.id, {
              x: startPosition.x,
              y: startPosition.y,
            });
          }
        }

        const prevMap = new Map(prev.map(n => [n.id, n] as [string, typeof n]));
        const updated = prev.map(n => ({ ...n }));

        const mainChange = posChanges[0] as LocalNodeChange;
        const movedId = mainChange.id as string;
        const movedPrev = prevMap.get(movedId);
        if (!movedPrev) {
          (changes as LocalNodeChange[]).forEach(ch => {
            if (ch.id) {
              const idx = updated.findIndex(u => u.id === ch.id);
              if (idx !== -1) {
                if (ch.type === 'position' && ch.position) {
                  updated[idx].position = ch.position as {
                    x: number;
                    y: number;
                  };
                }
                if (ch.type === 'select' && typeof ch.selected === 'boolean') {
                  (updated[idx] as NodeExt).selected = ch.selected as boolean;
                }
              }
            }
          });

          return updated;
        }

        (changes as LocalNodeChange[]).forEach(ch => {
          if (ch.id) {
            const idx = updated.findIndex(u => u.id === ch.id);
            if (idx !== -1) {
              if (ch.type === 'position' && ch.position) {
                updated[idx].position = ch.position as {
                  x: number;
                  y: number;
                };
              }
              if (ch.type === 'select' && typeof ch.selected === 'boolean') {
                (updated[idx] as NodeExt).selected = ch.selected as boolean;
              }
            }
          }
        });

        return updated;
      });
    },
    [isNodeDraggingRef, onNodesChange, setIsNodeDragging, setNodes]
  );

  return {
    handleNodeDragStart,
    handleNodeDragStop,
    handleNodesChange,
    nodePositionsAtDragStartRef,
  };
};
