import { useDeleteNoteLinkMutation } from 'app/store/api';
import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react';
import {
  BaseEdge,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from 'reactflow';
import cn from 'shared/lib/cn';

interface MultiColorStepEdgeData {
  isRelatedToSelected?: boolean;
  isSelected?: boolean;
  edgeColor?: string;
}

interface EdgeDeleteEventDetail {
  edgeId: string;
  source: string;
  target: string;
  newTarget?: string | null;
}

const MultiColorEdgeInner = (props: EdgeProps<MultiColorStepEdgeData>) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    source,
    target,
    style = {},
    data,
  } = props;
  const { setEdges, screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const [deleteNoteLink] = useDeleteNoteLinkMutation();

  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [currentTargetNode, setCurrentTargetNode] = useState<string | null>(
    null
  );
  const dragDataRef = useRef<EdgeDeleteEventDetail>({
    edgeId: id,
    source,
    target,
  });

  const strokeColor = data?.edgeColor || '#6b7280';
  const validColor = '#10b981';
  const invalidColor = '#ef4444';

  const findNodeUnderCursor = useCallback(
    (clientX: number, clientY: number) => {
      const flowPosition = screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      const nodes = getNodes();
      return nodes.find(node => {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const nodeWidth = node.width || 160;
        const nodeHeight = node.height || 80;

        return (
          flowPosition.x >= nodeX &&
          flowPosition.x <= nodeX + nodeWidth &&
          flowPosition.y >= nodeY &&
          flowPosition.y <= nodeY + nodeHeight &&
          node.id !== source
        );
      });
    },
    [screenToFlowPosition, getNodes, source]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(true);
      setCurrentTargetNode(null);

      dragDataRef.current = { edgeId: id, source, target };

      const startEvent = new CustomEvent<EdgeDeleteEventDetail>(
        'edgeDeleteStart',
        {
          detail: dragDataRef.current,
        }
      );
      document.dispatchEvent(startEvent);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        setDragPosition({ x: moveEvent.clientX, y: moveEvent.clientY });

        const targetNode = findNodeUnderCursor(
          moveEvent.clientX,
          moveEvent.clientY
        );
        setCurrentTargetNode(targetNode?.id || null);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        setIsDragging(false);
        setDragPosition(null);
        setCurrentTargetNode(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const targetNode = findNodeUnderCursor(
          upEvent.clientX,
          upEvent.clientY
        );

        const eventDetail: EdgeDeleteEventDetail = {
          ...dragDataRef.current,
          newTarget: targetNode?.id || null,
        };

        const dropEvent = new CustomEvent<EdgeDeleteEventDetail>(
          'edgeDeleteDrop',
          {
            detail: eventDetail,
          }
        );
        document.dispatchEvent(dropEvent);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [id, source, target, findNodeUnderCursor]
  );

  const handleDeleteEdge = useCallback(async () => {
    try {
      const edgeParts = id.split('-');
      const layoutId = edgeParts[2] || 'default';

      await deleteNoteLink({
        layoutId,
        firstNoteId: source,
        secondNoteId: target,
      }).unwrap();

      setEdges(eds => eds.filter(e => e.id !== id));
    } catch (_error) {}
  }, [id, source, target, deleteNoteLink, setEdges]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('Удалить связь между заметками?')) {
        handleDeleteEdge();
      }
    },
    [handleDeleteEdge]
  );

  const isConnectionExists = useCallback(() => {
    if (!currentTargetNode) return false;
    const edges = getEdges();
    return edges.some(
      edge => edge.source === source && edge.target === currentTargetNode
    );
  }, [currentTargetNode, source, getEdges]);

  const getNodeFlowInfo = (
    nodeId: string | null,
    fallbackX: number,
    fallbackY: number
  ) => {
    const fallbackCenter = { x: fallbackX, y: fallbackY };
    if (!nodeId)
      return {
        center: fallbackCenter,
        anchors: {
          top: fallbackCenter,
          right: fallbackCenter,
          bottom: fallbackCenter,
          left: fallbackCenter,
        },
      };

    try {
      const nodeEl = document.querySelector<HTMLElement>(
        `.react-flow__node[data-id="${nodeId}"]`
      );
      if (nodeEl) {
        const rect = nodeEl.getBoundingClientRect();
        const top = screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        const bottom = screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height,
        });
        const left = screenToFlowPosition({
          x: rect.left,
          y: rect.top + rect.height / 2,
        });
        const right = screenToFlowPosition({
          x: rect.left + rect.width,
          y: rect.top + rect.height / 2,
        });
        const center = screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        return { center, anchors: { top, right, bottom, left } };
      }
    } catch (_e) {}

    const node = getNodes().find(n => n.id === nodeId);
    if (node) {
      const cx = node.position.x + (node.width || 160) / 2;
      const cy = node.position.y + (node.height || 80) / 2;
      const w = node.width || 160;
      const h = node.height || 80;
      return {
        center: { x: cx, y: cy },
        anchors: {
          top: { x: cx, y: node.position.y },
          right: { x: node.position.x + w, y: cy },
          bottom: { x: cx, y: node.position.y + h },
          left: { x: node.position.x, y: cy },
        },
      };
    }

    return {
      center: fallbackCenter,
      anchors: {
        top: fallbackCenter,
        right: fallbackCenter,
        bottom: fallbackCenter,
        left: fallbackCenter,
      },
    };
  };

  const chooseClosestAnchor = (
    anchors: {
      top: { x: number; y: number };
      right: { x: number; y: number };
      bottom: { x: number; y: number };
      left: { x: number; y: number };
    },
    point: { x: number; y: number }
  ) => {
    const list = [anchors.top, anchors.right, anchors.bottom, anchors.left];
    let min = Infinity;
    let pick = list[0];
    for (const a of list) {
      const dx = a.x - point.x;
      const dy = a.y - point.y;
      const d = dx * dx + dy * dy;
      if (d < min) {
        min = d;
        pick = a;
      }
    }
    return pick;
  };

  const [viewportTick, setViewportTick] = useState(0);

  const edgePath = useMemo(() => {
    const sourceInfo = getNodeFlowInfo(source, sourceX, sourceY);
    const targetInfo = getNodeFlowInfo(target, targetX, targetY);

    const sourceAnchor = chooseClosestAnchor(
      sourceInfo.anchors,
      targetInfo.center
    );
    const targetAnchor = chooseClosestAnchor(
      targetInfo.anchors,
      sourceInfo.center
    );

    return getBezierPath({
      sourceX: sourceAnchor.x,
      sourceY: sourceAnchor.y,
      targetX: targetAnchor.x,
      targetY: targetAnchor.y,
    })[0];
  }, [
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    screenToFlowPosition,
    getNodes,
    viewportTick,
  ]);

  useEffect(() => {
    let mounted = true;
    const tryBump = () => {
      if (!mounted) return;
      setViewportTick(t => t + 1);
    };

    const viewportSelector = '.react-flow__viewport';
    const nodesSelector = '.react-flow__nodes';

    const observers: MutationObserver[] = [];

    const observeEl = (el: Element | null, opts: MutationObserverInit) => {
      if (!el) return;
      const mo = new MutationObserver(() => {
        tryBump();
      });
      mo.observe(el, opts);
      observers.push(mo);
    };

    const viewportEl = document.querySelector(viewportSelector);
    const nodesEl = document.querySelector(nodesSelector);

    observeEl(viewportEl, { attributes: true, attributeFilter: ['style'] });

    // Observe node subtree for style/transform changes to bump edge recomputation
    observeEl(nodesEl, {
      attributes: true,
      attributeFilter: ['style', 'transform'],
      childList: true,
      subtree: true,
    });

    if (!nodesEl) {
      const bodyMo = new MutationObserver(() => {
        if (document.querySelector(nodesSelector)) {
          tryBump();
        }
      });
      bodyMo.observe(document.body, { childList: true, subtree: true });
      observers.push(bodyMo);
    }

    tryBump();

    return () => {
      mounted = false;
      observers.forEach(o => o.disconnect());
    };
  }, []);

  const getDragEdgePath = () => {
    const usePos = dragPosition;
    if (!usePos) return '';

    const flowPosition = screenToFlowPosition({ x: usePos.x, y: usePos.y });

    const sourceInfo = getNodeFlowInfo(source, sourceX, sourceY);

    if (currentTargetNode) {
      const targetInfo = getNodeFlowInfo(currentTargetNode, targetX, targetY);
      const sourceAnchor = chooseClosestAnchor(
        sourceInfo.anchors,
        flowPosition
      );
      const targetAnchor = chooseClosestAnchor(
        targetInfo.anchors,
        sourceInfo.center
      );
      return `M ${sourceAnchor.x} ${sourceAnchor.y} L ${targetAnchor.x} ${targetAnchor.y}`;
    }

    const sourceAnchor = chooseClosestAnchor(sourceInfo.anchors, flowPosition);
    return `M ${sourceAnchor.x} ${sourceAnchor.y} L ${flowPosition.x} ${flowPosition.y}`;
  };

  const markerEnd = undefined;
  const markerStart = undefined;
  return (
    <>
      {!isDragging && (
        <BaseEdge
          path={edgePath}
          markerStart={markerStart}
          markerEnd={markerEnd}
          style={{
            stroke: strokeColor,
            fill: 'none',
            transition:
              'stroke-width 180ms ease, opacity 180ms ease, stroke-dasharray 180ms ease',
            ...style,
          }}
        />
      )}

      {isDragging && dragPosition && (
        <path
          d={getDragEdgePath()}
          markerStart={markerStart}
          markerEnd={markerEnd}
          fill='none'
          stroke={
            currentTargetNode
              ? isConnectionExists()
                ? invalidColor
                : validColor
              : strokeColor
          }
          strokeWidth='3'
          strokeDasharray='5,5'
          className={cn('animate-pulse')}
        />
      )}

      <path
        d={edgePath}
        fill='none'
        stroke='transparent'
        strokeWidth='20'
        className={cn('react-flow__edge-interaction cursor-crosshair')}
        onMouseDown={handleMouseDown}
      />

      {!isDragging && (
        <g
          transform={`translate(${(sourceX + targetX) / 2}, ${(sourceY + targetY) / 2})`}
        >
          <circle
            r='8'
            fill='white'
            stroke='#ff6b6b'
            strokeWidth='2'
            className={cn(
              'cursor-grab opacity-0 transition-opacity duration-200 hover:opacity-100'
            )}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
          />
          <text
            x='0'
            y='0'
            dy='.3em'
            textAnchor='middle'
            fontSize='10'
            fontWeight='bold'
            fill='#ff6b6b'
            className={cn(
              'pointer-events-none opacity-0 transition-opacity duration-200 hover:opacity-100'
            )}
          >
            ×
          </text>
        </g>
      )}

      <title>Перетащите связь для удаления или переподключения</title>
    </>
  );
};
export const MultiColorEdge = React.memo(MultiColorEdgeInner);
