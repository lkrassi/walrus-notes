import { useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  Connection,
  Edge,
  Node,
  NodeChange,
  OnConnect,
  OnNodesChange,
  NodeDragHandler,
} from 'reactflow';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Note } from 'shared/model/types/layouts';
import type { GraphNode } from 'shared/model/types/notes';
import { useDebouncedCallback } from 'widgets/hooks';
import {
  useGetPosedNotesQuery,
  useUpdateNotePositionMutation,
} from 'widgets/model/stores/api';
import { DropZone } from 'widgets/ui';
import { UnposedNotesList } from './UnposedNotesList';

interface NotesGraphProps {
  layoutId: string;
}

const NoteNode = ({ data }: { data: { note: Note } }) => {
  return (
    <div className='max-w-[300px] min-w-[200px] rounded-lg border border-gray-300 bg-white p-4 shadow-md'>
      <h3 className='mb-2 truncate font-semibold text-gray-800'>
        {data.note.title}
      </h3>
      <p className='line-clamp-3 text-sm text-gray-600'>
        {data.note.payload || 'Нет содержимого'}
      </p>
    </div>
  );
};

const nodeTypes = {
  note: NoteNode,
};

const NotesGraphContent = ({ layoutId }: NotesGraphProps) => {
  const { data: posedNotesResponse, isLoading } = useGetPosedNotesQuery({
    layoutId,
  });
  const [updatePosition] = useUpdateNotePositionMutation();
  const { screenToFlowPosition } = useReactFlow();

  // Стабилизированная функция обновления позиции
  const updatePositionCallback = useCallback(
    async (noteId: string, xPos: number, yPos: number) => {
      try {
        await updatePosition({
          layoutId,
          noteId,
          xPos,
          yPos,
        }).unwrap();
      } catch (error) {
        console.error('Failed to update note position:', error);
      }
    },
    [layoutId, updatePosition]
  );

  // Debounced функция для обновления позиции (только когда отпустил)
  const debouncedUpdatePosition = useDebouncedCallback(
    updatePositionCallback,
    500 // 500ms задержка после отпускания
  );

  const posedNotes = posedNotesResponse?.data || [];

  const handleAddNoteToGraph = useCallback(
    (item: any, dropPosition?: { x: number; y: number }) => {
      const note = item.data || item;
      // Используем позицию дропа или случайную позицию
      const newPosition = dropPosition || {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      };

      updatePosition({
        layoutId,
        noteId: note.id,
        xPos: newPosition.x,
        yPos: newPosition.y,
      }).catch(error => {
        console.error('Failed to add note to graph:', error);
      });
    },
    [layoutId, updatePosition]
  );

  const initialNodes: Node[] = useMemo(() => {
    return posedNotes.map(
      (note: Note): GraphNode => ({
        id: note.id,
        type: 'note',
        position: {
          x: note.position?.xPos || Math.random() * 500,
          y: note.position?.yPos || Math.random() * 500,
        },
        data: { note },
      })
    );
  }, [posedNotes]);

  const initialEdges: Edge[] = useMemo(() => {
    // Пока нет связей между заметками
    return [];
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      debouncedUpdatePosition(node.id, node.position.x, node.position.y);
    },
    [debouncedUpdatePosition]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  // Обновляем ноды при изменении данных с сервера
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-gray-500'>Загрузка графа...</div>
      </div>
    );
  }

  const handleDrop = useCallback(
    (item: any, event?: React.DragEvent) => {
      if (event) {
        // Используем React Flow screenToFlowPosition для точного позиционирования
        const dropPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        handleAddNoteToGraph(item, dropPosition);
      } else {
        handleAddNoteToGraph(item);
      }
    },
    [handleAddNoteToGraph, screenToFlowPosition]
  );

  return (
    <DropZone
      accepts={['note']}
      onDrop={handleDrop}
      className='relative flex h-full w-full'
      activeClassName='bg-blue-50 border-2 border-dashed border-blue-300'
    >
      <div className='flex-1'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition='bottom-left'
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <UnposedNotesList
        layoutId={layoutId}
        onNoteSelect={handleAddNoteToGraph}
      />
    </DropZone>
  );
};

export const NotesGraph = ({ layoutId }: NotesGraphProps) => {
  return (
    <ReactFlowProvider>
      <NotesGraphContent layoutId={layoutId} />
    </ReactFlowProvider>
  );
};
