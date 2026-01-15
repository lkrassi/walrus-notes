import { useCallback, useRef } from 'react';
import type { Node, NodeChange, Edge } from 'reactflow';
import { MoveNodeCommand } from '../commands';
import type { useGraphHistory } from './useGraphHistory';

type GraphHistory = ReturnType<typeof useGraphHistory>;

interface UseGraphDragHandlersProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  updatePositionCallback: (nodeId: string, x: number, y: number) => void;
  graphHistory: GraphHistory;
  isNodeDraggingRef: React.MutableRefObject<boolean>;
  isProcessingRef: React.MutableRefObject<boolean>;
  rfSetNodes?: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  onNodeDragStop?: (event: React.MouseEvent, node: Node) => void;
  setIsNodeDragging?: (dragging: boolean) => void;
  onNodesChange?: (changes: NodeChange[]) => void;
  rfSetEdges?: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
}

interface NodeExt extends Node {
  selected?: boolean;
  width?: number | null;
  height?: number | null;
}

/**
 * Управляет всеми операциями drag-and-drop для nodes.
 *
 * Обрабатывает:
 * - handleNodeDragStart: Инициация drag, сохранение позиций
 * - handleNodeDragStop: Создание команды для истории, синхронизация с API
 * - handleNodeMouseEnter/Leave: Обёрнут в проверку, что не во время drag
 * - handleNodesChange: Специальная логика для multi-select drag
 *
 * Поддерживает multi-select: Если выбрано несколько nodes, все двигаются вместе
 */
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
  const nodePositionsAtDragStartRef = useRef<
    Map<string, { x: number; y: number }>
  >(new Map());
  const lastBoxSelectedIdsRef = useRef<Set<string>>(new Set());

  // Обработчик начала drag
  const handleNodeDragStart = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      isNodeDraggingRef.current = true;
      setIsNodeDragging?.(true);

      const selectedNodes = nodes.filter((n: NodeExt) => n.selected);
      const nodesToSave = selectedNodes.some(n => n.id === node.id)
        ? selectedNodes
        : [node];

      nodePositionsAtDragStartRef.current = new Map(
        nodesToSave.map(n => [n.id, { ...n.position }])
      );
    },
    [nodes, isNodeDraggingRef, setIsNodeDragging]
  );

  // Обработчик окончания drag
  const handleNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      if (!node) {
        try {
          isNodeDraggingRef.current = false;
          setIsNodeDragging?.(false);
        } catch (_e) {
          // ignore
        }
        return;
      }

      try {
        const selectedNodes = nodes.filter((n: NodeExt) => n.selected);
        const isMultiSelect =
          selectedNodes.length > 1 && selectedNodes.some(n => n.id === node.id);

        const movedNodes = isMultiSelect ? selectedNodes : [node];
        isProcessingRef.current = true;

        for (const movedNode of movedNodes) {
          const startPos = nodePositionsAtDragStartRef.current.get(
            movedNode.id
          );
          const currentNode = nodes.find(n => n.id === movedNode.id);
          const endPos = currentNode?.position;

          if (
            startPos &&
            endPos &&
            (startPos.x !== endPos.x || startPos.y !== endPos.y)
          ) {
            const command = new MoveNodeCommand(
              movedNode.id,
              startPos,
              endPos,
              (nodeId: string, position: { x: number; y: number }) => {
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
                } catch (_e) {
                  // ignore
                }
                try {
                  const change = {
                    id: nodeId,
                    type: 'position',
                    position,
                    dragging: false,
                  } as unknown as NodeChange;
                  onNodesChange?.([change]);
                } catch (_e) {
                  // ignore
                }
                try {
                  rfSetEdges?.(prev => prev.map(e => ({ ...e })));
                } catch (_e) {
                  // ignore
                }
                updatePositionCallback(nodeId, position.x, position.y);
              }
            );
            await graphHistory.executeCommand(command);
            updatePositionCallback(movedNode.id, endPos.x, endPos.y);
          }
        }
      } catch (_e) {
        onNodeDragStop?.(_event, node);
      } finally {
        isProcessingRef.current = false;
      }

      try {
        isNodeDraggingRef.current = false;
        setIsNodeDragging?.(false);
      } catch (_e) {
        // ignore
      }
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
    ]
  );

  // Обработчик изменения nodes (включая multi-select)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      type LocalNodeChange = {
        id?: string;
        type?: 'position' | 'select' | string;
        position?: { x: number; y: number } | null;
        selected?: boolean;
      };

      const posChanges = (changes as LocalNodeChange[]).filter(
        ch => ch.type === 'position' && ch.position
      );
      if (posChanges.length === 0) {
        onNodesChange?.(changes);
        return;
      }

      setNodes(prev => {
        const prevMap = new Map(prev.map(n => [n.id, n] as [string, typeof n]));
        const updated = prev.map(n => ({ ...n }));

        const mainChange = posChanges[0] as LocalNodeChange;
        const movedId = mainChange.id as string;
        const newPos = mainChange.position as { x: number; y: number };
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
                  const changingId = ch.id as string;
                  const requested = ch.selected as boolean;
                  if (
                    !requested &&
                    lastBoxSelectedIdsRef.current.has(changingId)
                  ) {
                    (updated[idx] as NodeExt).selected = true;
                  } else {
                    (updated[idx] as NodeExt).selected = requested;
                  }
                }
              }
            }
          });

          return updated;
        }

        const dx = newPos.x - (movedPrev.position?.x ?? 0);
        const dy = newPos.y - (movedPrev.position?.y ?? 0);

        const selectedIds = new Set(
          prev
            .filter((n: Node & { selected?: boolean }) => n.selected)
            .map(n => n.id)
        );

        if (selectedIds.size > 1 && selectedIds.has(movedId)) {
          return prev.map(n =>
            selectedIds.has(n.id)
              ? {
                  ...n,
                  position: { x: n.position.x + dx, y: n.position.y + dy },
                }
              : n
          );
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
                const changingId = ch.id as string;
                const requested = ch.selected as boolean;
                if (
                  !requested &&
                  lastBoxSelectedIdsRef.current.has(changingId)
                ) {
                  (updated[idx] as NodeExt).selected = true;
                } else {
                  (updated[idx] as NodeExt).selected = requested;
                }
              }
            }
          }
        });

        return updated;
      });
    },
    [setNodes, onNodesChange]
  );

  return {
    handleNodeDragStart,
    handleNodeDragStop,
    handleNodesChange,
    nodePositionsAtDragStartRef,
    lastBoxSelectedIdsRef,
  };
};
