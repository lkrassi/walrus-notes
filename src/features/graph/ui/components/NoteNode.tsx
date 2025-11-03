import { Handle, Position } from 'reactflow';
import type { Note } from 'shared/model/types/layouts';
import { generateColorFromId } from '../../model/utils/graphUtils';

interface NoteNodeProps {
  data: {
    note: Note;
    onNoteClick?: (noteId: string) => void;
    selected?: boolean;
    isRelatedToSelected?: boolean;
  };
  selected: boolean;
}

export const NoteNodeComponent = ({ data, selected }: NoteNodeProps) => {
  const nodeColor = generateColorFromId(data.note.id);

  const handleStyle = {
    background: nodeColor,
    border: '2px solid white',
    width: 15,
    height: 15,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onNoteClick?.(data.note.id);
  };

  return (
    <button
      onDoubleClick={handleDoubleClick}
      className={`max-w-40 min-w-40 cursor-pointer rounded-xl p-2 text-left transition-all duration-200 ${
        selected
          ? 'shadow-lg ring-4 ring-blue-400'
          : 'shadow-md hover:shadow-lg'
      }`}
      style={{
        backgroundColor: nodeColor,
        opacity: data.isRelatedToSelected !== false ? 1 : 0.5,
      }}
      title='Двойной клик для открытия заметки'
    >
      {/* Source handles */}
      <Handle
        type='source'
        position={Position.Right}
        id='source-right' // Уникальный id
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Left}
        id='source-left' // Уникальный id
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Top}
        id='source-top' // Уникальный id
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Bottom}
        id='source-bottom' // Уникальный id
        style={handleStyle}
      />

      {/* Target handles */}
      <Handle
        type='target'
        position={Position.Right}
        id='target-right' // Уникальный id
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Left}
        id='target-left' // Уникальный id
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Top}
        id='target-top' // Уникальный id
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Bottom}
        id='target-bottom' // Уникальный id
        style={handleStyle}
      />

      <h3 className='font-semibold text-dark-text m-3 text-center'>
        {data.note.title}
      </h3>
    </button>
  );
};
