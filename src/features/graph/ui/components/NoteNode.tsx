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
      {/* ✅ Source handles - ОТКУДА идут линии (ИЗ этой заметки) */}
      <Handle
        type='source'
        position={Position.Right}
        id='source-right'
        style={handleStyle}
        title='Создать связь ИЗ этой заметки'
      />
      <Handle
        type='source'
        position={Position.Left}
        id='source-left'
        style={handleStyle}
        title='Создать связь ИЗ этой заметки'
      />
      <Handle
        type='source'
        position={Position.Top}
        id='source-top'
        style={handleStyle}
        title='Создать связь ИЗ этой заметки'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        id='source-bottom'
        style={handleStyle}
        title='Создать связь ИЗ этой заметки'
      />

      {/* ✅ Target handles - КУДА приходят линии (В эту заметку) */}
      <Handle
        type='target'
        position={Position.Right}
        id='target-right'
        style={handleStyle}
        title='Создать связь В эту заметку'
      />
      <Handle
        type='target'
        position={Position.Left}
        id='target-left'
        style={handleStyle}
        title='Создать связь В эту заметку'
      />
      <Handle
        type='target'
        position={Position.Top}
        id='target-top'
        style={handleStyle}
        title='Создать связь В эту заметку'
      />
      <Handle
        type='target'
        position={Position.Bottom}
        id='target-bottom'
        style={handleStyle}
        title='Создать связь В эту заметку'
      />

      <h3 className='text-dark-text m-3 text-center font-semibold'>
        {data.note.title}
      </h3>

      {/* ✅ ИСПРАВЛЕНО: Показываем исходящие связи */}
      <div className='text-dark-text/70 text-center text-xs'>
        {data.note.linkedWith?.length || 0} исходящих связей
      </div>
    </button>
  );
};
