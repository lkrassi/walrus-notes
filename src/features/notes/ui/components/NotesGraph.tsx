import React, { useCallback, useEffect, useMemo } from 'react';
import type {
  Connection,
  Edge,
  Node,
  NodeChange,
  NodeDragHandler,
  OnConnect,
  OnNodesChange,
} from 'reactflow';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Note } from 'shared/model/types/layouts';
import {
  useGetPosedNotesQuery,
  useUpdateNotePositionMutation,
} from 'widgets/model/stores/api';
import { EmptyGraphState } from './EmptyGraphState';
import { UnposedNotesList } from './UnposedNotesList';

interface NotesGraphProps {
  layoutId: string;
}

const NoteNodeComponent = ({ data }: { data: { note: Note } }) => (
  <div className='max-w-40 min-w-40 rounded-xl bg-black p-2 transition duration-200 hover:scale-102 hover:bg-black/90 active:scale-98 dark:bg-white dark:hover:bg-white/90'>
    <h3 className='text-dark-text dark:text-text mb-2 truncate font-semibold'>
      {data.note.title}
    </h3>
    <p className='text-dark-text dark:text-text line-clamp-3 text-sm'>
      {data.note.payload || 'Нет содержимого'}
    </p>
  </div>
);

const nodeTypes = {
  note: NoteNodeComponent,
};

const NotesGraphContent = React.memo(({ layoutId }: NotesGraphProps) => {
  const { data: posedNotesResponse, isLoading } = useGetPosedNotesQuery({
    layoutId,
  });
  const [updatePosition] = useUpdateNotePositionMutation();
  const { screenToFlowPosition, addNodes } = useReactFlow();

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

  const posedNotes = posedNotesResponse?.data || [];

  const initialNodes: Node[] = useMemo(() => {
    return posedNotes.map((note: Note) => ({
      id: note.id,
      type: 'note' as const,
      position: {
        x: note.position?.xPos || Math.random() * 500,
        y: note.position?.yPos || Math.random() * 500,
      },
      data: { note },
    }));
  }, [posedNotes]);

  const initialEdges: Edge[] = useMemo(() => {
    // пока нет связей между заметками
    return [];
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleAddNoteToGraph = useCallback(
    (item: any, dropPosition?: { x: number; y: number }) => {
      const note = item.data || item;
      const newPosition = dropPosition || {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      };

      const newNode = {
        id: note.id,
        type: 'note' as const,
        position: newPosition,
        data: { note },
      };
      addNodes(newNode);

      updatePosition({
        layoutId,
        noteId: note.id,
        xPos: newPosition.x,
        yPos: newPosition.y,
      }).catch(error => {
        console.error('Failed to add note to graph:', error);
        setNodes(currentNodes =>
          currentNodes.filter(node => node.id !== note.id)
        );
      });
    },
    [layoutId, updatePosition, addNodes, setNodes]
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      updatePositionCallback(node.id, node.position.x, node.position.y);
    },
    [updatePositionCallback]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

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

  if (posedNotes.length === 0) {
    return <EmptyGraphState layoutTitle='Граф заметок' layoutId={layoutId} />;
  }

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const noteData = event.dataTransfer.getData('application/reactflow');
      if (noteData) {
        try {
          const note = JSON.parse(noteData);
          const dropPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          handleAddNoteToGraph(note, dropPosition);
        } catch (error) {
          console.error('Failed to parse note data:', error);
        }
      }
    },
    [handleAddNoteToGraph, screenToFlowPosition]
  );

  return (
    <div className='bg-bg dark:bg-dark-bg relative flex h-full w-full'>
      <div
        className='flex-1'
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
      >
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
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          key={layoutId}
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position='top-right'>
            <UnposedNotesList
              layoutId={layoutId}
              onNoteSelect={handleAddNoteToGraph}
            />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
});

export const NotesGraph = ({ layoutId }: NotesGraphProps) => {
  return (
    <ReactFlowProvider>
      <NotesGraphContent layoutId={layoutId} />
    </ReactFlowProvider>
  );
};
