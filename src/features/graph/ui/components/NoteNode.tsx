import { Handle, Position } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';

interface NoteNodeProps {
  data: { note: Note };
  selected: boolean;
}

export const generateColorFromId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
  ];

  return colors[Math.abs(hash) % colors.length];
};

export const NoteNodeComponent = ({ data, selected }: NoteNodeProps) => {
  const nodeColor = generateColorFromId(data.note.id);

  const handleStyle = {
    background: nodeColor,
    border: '2px solid white',
    width: 10,
    height: 10,
  };

  return (
    <div
      className={`max-w-40 min-w-40 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
        selected
          ? 'shadow-lg ring-4 ring-blue-400'
          : 'shadow-md hover:shadow-lg'
      }`}
      style={{
        backgroundColor: nodeColor,
        border: `2px solid ${selected ? '#3b82f6' : 'transparent'}`,
      }}
    >
      <Handle
        type='source'
        position={Position.Right}
        id='right'
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Left}
        id='left'
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Top}
        id='top'
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Bottom}
        id='bottom'
        style={handleStyle}
      />

      <Handle
        type='target'
        position={Position.Right}
        id='right'
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Left}
        id='left'
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Top}
        id='top'
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Bottom}
        id='bottom'
        style={handleStyle}
      />

      <h3 className='mb-2 truncate font-semibold text-white'>
        {data.note.title}
      </h3>
      <p className='line-clamp-3 text-sm text-white/90'>
        {data.note.payload || 'Нет содержимого'}
      </p>
    </div>
  );
};
