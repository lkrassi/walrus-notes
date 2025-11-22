import {
  useCreateNoteLinkMutation,
  useDeleteNoteLinkMutation,
} from 'app/store/api';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from 'reactflow';
import type { Note } from 'shared/model/types/layouts';
import { useGraphConnections } from '../../model/hooks/useGraphConnections';
import { useGraphHandlers } from '../../model/hooks/useGraphHandlers';
import { useGraphSelection } from '../../model/hooks/useGraphSelection';
import { useNotesGraph } from '../../model/hooks/useNotesGraph';
import NotesGraphView from './NotesGraphView';
import { useEdgeDeleteEvents } from './useEdgeDeleteEvents';

interface NotesGraphContentProps {
  layoutId: string;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
}

const NotesGraphContentComponent = ({
  layoutId,
  onNoteOpen,
}: NotesGraphContentProps) => {
  const {
    initialNodes,
    initialEdges,
    selectedNodeId,
    hoveredNodeId,
    updatePositionCallback,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPaneClick,
  } = useNotesGraph({ layoutId });

  const {
    screenToFlowPosition,
    getEdges,
    getNodes: _getNodes,
  } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
  const [deleteNoteLink] = useDeleteNoteLinkMutation();
  const [createNoteLink] = useCreateNoteLinkMutation();
  const [isDraggingEdge, setIsDraggingEdge] = useState(false);

  const isProcessingRef = useRef(false);
  const prevLayoutIdRef = useRef(layoutId);

  useEffect(() => {
    if (prevLayoutIdRef.current !== layoutId) {
      setNodes(
        initialNodes.map((n, i) => ({
          ...n,
          data: { ...(n.data || {}) },
        }))
      );
      setEdgesState(initialEdges);
      prevLayoutIdRef.current = layoutId;
    } else {
      setNodes(
        initialNodes.map((n, i) => ({
          ...n,
          data: { ...(n.data || {}) },
        }))
      );
      setEdgesState(initialEdges);
    }
  }, [initialNodes, initialEdges, layoutId, setNodes, setEdgesState]);

  const {
    tempEdges,
    allEdges,
    onConnectStart,
    onConnectEnd,
    onConnect,
    setTempEdges,
  } = useGraphConnections({
    layoutId,
    nodes,
    edges,
    selectedNodeId,
    hoveredNodeId,
    screenToFlowPosition,
    onEdgeCreated: newEdge => {
      setEdgesState(prev => {
        if (prev.some(e => e.id === newEdge.id)) return prev;
        return [...prev, newEdge];
      });
    },
  });

  useEffect(() => {
    if (tempEdges.length > 0) {
      setTempEdges(prev =>
        prev.filter(tempEdge => !edges.some(edge => edge.id === tempEdge.id))
      );
    }
  }, [edges, tempEdges.length, setTempEdges]);

  const handleEdgeDeleteDrop = useCallback(
    async (
      event: CustomEvent<{
        edgeId: string;
        source: string;
        target: string;
        newTarget?: string | null;
      }>
    ) => {
      const { edgeId, source, target, newTarget } = event.detail;

      if (isProcessingRef.current) return;

      isProcessingRef.current = true;
      setIsDraggingEdge(false);

      try {
        const currentEdges = getEdges();

        if (newTarget) {
          const connectionExists = currentEdges.some(
            edge => edge.source === source && edge.target === newTarget
          );

          if (connectionExists) return;

          await deleteNoteLink({
            layoutId,
            firstNoteId: source,
            secondNoteId: target,
          });
          await createNoteLink({
            layoutId,
            firstNoteId: source,
            secondNoteId: newTarget,
          });

          setEdgesState(eds => {
            const filteredEdges = eds.filter(edge => edge.id !== edgeId);
            const edgesWithoutNewTarget = filteredEdges.filter(
              edge => !(edge.source === source && edge.target === newTarget)
            );

            const newEdge = {
              id: `edge-${source}-${newTarget}`,
              source,
              target: newTarget,
              type: 'multiColor' as const,
              data: {
                sourceColor:
                  eds.find(e => e.source === source)?.data?.sourceColor ||
                  '#6b7280',
                targetColor:
                  eds.find(e => e.target === newTarget)?.data?.targetColor ||
                  '#6b7280',
              },
            };

            return [...edgesWithoutNewTarget, newEdge];
          });
        } else {
          await deleteNoteLink({
            layoutId,
            firstNoteId: source,
            secondNoteId: target,
          });
          setEdgesState(eds => eds.filter(edge => edge.id !== edgeId));
        }
      } catch (_error) {
      } finally {
        isProcessingRef.current = false;
      }
    },
    [layoutId, deleteNoteLink, createNoteLink, setEdgesState, getEdges]
  );

  const handleEdgeDeleteStart = useCallback(() => {
    setIsDraggingEdge(true);
  }, []);

  useEdgeDeleteEvents(handleEdgeDeleteDrop, handleEdgeDeleteStart);

  const handleNoteOpen = useCallback(
    (noteId: string) => {
      const node = nodes.find(n => n.id === noteId);
      if (node?.data?.note) {
        onNoteOpen?.({ noteId, note: node.data.note });
      }
    },
    [nodes, onNoteOpen]
  );

  const { edgesWithSelection, nodesWithSelection } = useGraphSelection({
    nodes,
    edges,
    tempEdges,
    selectedNodeId,
    hoveredNodeId,
    allEdges,
    onNoteOpen: handleNoteOpen,
  });

  const {
    handleAddNoteToGraph,
    onNodeDragStop,
    handleNodesChange,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
  } = useGraphHandlers({
    updatePositionCallback,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onNodesChange,
    screenToFlowPosition,
  });

  const handleNodeDragStopMulti = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      try {
        const selectedNodes = nodes.filter(n => (n as any).selected);
        if (
          selectedNodes.length > 1 &&
          selectedNodes.some(n => n.id === node.id)
        ) {
          selectedNodes.forEach(n => {
            updatePositionCallback(n.id, n.position.x, n.position.y);
          });
          return;
        }

        onNodeDragStop(_event, node);
      } catch (_e) {
        onNodeDragStop(_event, node);
      }
    },
    [nodes, updatePositionCallback, onNodeDragStop]
  );

  const handleNodesChangeMulti = useCallback(
    (changes: any[]) => {
      const posChanges = changes.filter(
        ch => ch.type === 'position' && (ch as any).position
      );
      if (posChanges.length === 0) {
        handleNodesChange(changes);
        return;
      }

      setNodes(prev => {
        const prevMap = new Map(prev.map(n => [n.id, n] as [string, typeof n]));
        const updated = prev.map(n => ({ ...n }));

        const mainChange = posChanges[0] as any;
        const movedId = mainChange.id as string;
        const newPos = mainChange.position as { x: number; y: number };
        const movedPrev = prevMap.get(movedId);
        if (!movedPrev) {
          changes.forEach(ch => {
            if ((ch as any).id) {
              const idx = updated.findIndex(u => u.id === (ch as any).id);
              if (idx !== -1) {
                if (ch.type === 'position' && (ch as any).position) {
                  updated[idx].position = (ch as any).position;
                }
                if (
                  ch.type === 'select' &&
                  typeof (ch as any).selected === 'boolean'
                ) {
                  (updated[idx] as any).selected = (ch as any).selected;
                }
              }
            }
          });
          return updated;
        }

        const dx = newPos.x - (movedPrev.position?.x ?? 0);
        const dy = newPos.y - (movedPrev.position?.y ?? 0);

        const selectedIds = new Set(
          prev.filter(n => (n as any).selected).map(n => n.id)
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

        changes.forEach(ch => {
          if ((ch as any).id) {
            const idx = updated.findIndex(u => u.id === (ch as any).id);
            if (idx !== -1) {
              if (ch.type === 'position' && (ch as any).position) {
                updated[idx].position = (ch as any).position;
              }
              if (
                ch.type === 'select' &&
                typeof (ch as any).selected === 'boolean'
              ) {
                (updated[idx] as any).selected = (ch as any).selected;
              }
            }
          }
        });

        return updated;
      });
    },
    [setNodes, handleNodesChange]
  );

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      node.data?.onNoteClick?.(node.id);
    },
    []
  );

  const handleNoteDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const noteData = event.dataTransfer.getData('application/reactflow');
      if (noteData) {
        try {
          const note = JSON.parse(noteData);
          const toFlowCoords = (clientX: number, clientY: number) => {
            try {
              const wrapper = document.querySelector(
                '.react-flow'
              ) as HTMLElement | null;
              const viewport = document.querySelector(
                '.react-flow__viewport'
              ) as HTMLElement | null;
              if (!wrapper || !viewport) {
                return screenToFlowPosition({ x: clientX, y: clientY });
              }

              const wrapperRect = wrapper.getBoundingClientRect();
              const style = window.getComputedStyle(viewport);
              const transform = style.transform || '';

              let scale = 1;
              let tx = 0;
              let ty = 0;

              if (transform && transform !== 'none') {
                const m = transform.match(/matrix\(([^)]+)\)/);
                if (m && m[1]) {
                  const parts = m[1].split(',').map(s => parseFloat(s.trim()));
                  if (parts.length >= 6) {
                    scale = parts[0];
                    tx = parts[4];
                    ty = parts[5];
                  }
                }
              }

              const localX = clientX - wrapperRect.left;
              const localY = clientY - wrapperRect.top;

              const flowX = (localX - tx) / scale;
              const flowY = (localY - ty) / scale;

              return { x: flowX, y: flowY };
            } catch (_e) {
              return screenToFlowPosition({ x: clientX, y: clientY });
            }
          };

          const dropPosition = toFlowCoords(event.clientX, event.clientY);
          handleAddNoteToGraph(note, dropPosition);
        } catch (_error) {}
      }
    },
    [handleAddNoteToGraph, screenToFlowPosition]
  );

  const handleBoxSelect = useCallback(
    (rect: { x1: number; y1: number; x2: number; y2: number }) => {
      try {
        const toFlowCoords = (clientX: number, clientY: number) => {
          try {
            const wrapper = document.querySelector(
              '.react-flow'
            ) as HTMLElement | null;
            const viewport = document.querySelector(
              '.react-flow__viewport'
            ) as HTMLElement | null;
            if (!wrapper || !viewport) {
              return screenToFlowPosition({ x: clientX, y: clientY });
            }

            const wrapperRect = wrapper.getBoundingClientRect();
            const style = window.getComputedStyle(viewport);
            const transform = style.transform || '';

            let scale = 1;
            let tx = 0;
            let ty = 0;

            if (transform && transform !== 'none') {
              const m = transform.match(/matrix\(([^)]+)\)/);
              if (m && m[1]) {
                const parts = m[1].split(',').map(s => parseFloat(s.trim()));
                if (parts.length >= 6) {
                  scale = parts[0];
                  tx = parts[4];
                  ty = parts[5];
                }
              }
            }

            const localX = clientX - wrapperRect.left;
            const localY = clientY - wrapperRect.top;

            const flowX = (localX - tx) / scale;
            const flowY = (localY - ty) / scale;

            return { x: flowX, y: flowY };
          } catch (_e) {
            return screenToFlowPosition({ x: clientX, y: clientY });
          }
        };

        const topLeft = toFlowCoords(rect.x1, rect.y1);
        const bottomRight = toFlowCoords(rect.x2, rect.y2);

        const fx1 = Math.min(topLeft.x, bottomRight.x);
        const fx2 = Math.max(topLeft.x, bottomRight.x);
        const fy1 = Math.min(topLeft.y, bottomRight.y);
        const fy2 = Math.max(topLeft.y, bottomRight.y);

        const nodesToSelect = nodes
          .filter(n => {
            const nx = n.position?.x ?? 0;
            const ny = n.position?.y ?? 0;
            const width = (n?.width as number) || 160;
            const height = (n?.height as number) || 80;
            const cx = nx + width / 2;
            const cy = ny + height / 2;
            return cx >= fx1 && cx <= fx2 && cy >= fy1 && cy <= fy2;
          })
          .map(n => n.id);

        if (nodesToSelect.length === 0) return;

        setNodes(prev =>
          prev.map(n => ({ ...n, selected: nodesToSelect.includes(n.id) }))
        );
      } catch (_e) {}
    },
    [nodes, screenToFlowPosition, setNodes]
  );

  return (
    <NotesGraphView
      layoutId={layoutId}
      nodes={nodes}
      edges={edges}
      nodesWithSelection={nodesWithSelection}
      edgesWithSelection={edgesWithSelection}
      onNodesChange={handleNodesChangeMulti}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodeDragStop={handleNodeDragStopMulti}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onPaneClick={onPaneClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      isDraggingEdge={isDraggingEdge}
      onDrop={handleNoteDrop}
      onBoxSelect={handleBoxSelect}
      onAddNoteToGraph={handleAddNoteToGraph}
    />
  );
};

export const NotesGraphContent = React.memo(NotesGraphContentComponent);
NotesGraphContent.displayName = 'NotesGraphContent';

export default NotesGraphContent;
