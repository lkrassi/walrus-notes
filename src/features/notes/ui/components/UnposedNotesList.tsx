import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { Draggable } from 'widgets/ui';
import { useGetUnposedNotesQuery } from 'widgets/model/stores/api';

interface UnposedNotesListProps {
  layoutId: string;
  onNoteSelect?: (note: Note) => void;
}

export const UnposedNotesList = ({
  layoutId,
  onNoteSelect,
}: UnposedNotesListProps) => {
  const { data: unposedNotesResponse, isLoading } = useGetUnposedNotesQuery({
    layoutId,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const unposedNotes = unposedNotesResponse?.data || [];

  if (isLoading) {
    return (
      <div className='absolute top-4 right-4 z-10 w-64 rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm'>
        <div className='p-3 text-xs text-gray-500'>Загрузка...</div>
      </div>
    );
  }

  if (unposedNotes.length === 0) {
    return null;
  }

  return (
    <div className='absolute top-4 right-4 z-10 w-64 rounded-lg border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex w-full items-center justify-between rounded-t-lg p-3 transition-colors hover:bg-gray-50/80'
      >
        <div className='flex items-center gap-2'>
          {isExpanded ? (
            <ChevronDown className='h-3 w-3 text-gray-500' />
          ) : (
            <ChevronRight className='h-3 w-3 text-gray-500' />
          )}
          <span className='text-xs font-semibold text-gray-700'>
            Без позиции ({unposedNotes.length})
          </span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='h-2 w-2 rounded-full bg-blue-500'></div>
        </div>
      </button>

      {isExpanded && (
        <div className='max-h-48 overflow-y-auto border-t border-gray-100'>
          <div className='space-y-1 p-2'>
            {unposedNotes.map(note => (
              <Draggable
                key={note.id}
                item={{
                  id: note.id,
                  type: 'note',
                  data: note,
                }}
                className='group flex cursor-pointer items-start gap-2 rounded-md border border-transparent p-2 transition-all hover:border-blue-100 hover:bg-blue-50 hover:shadow-sm'
                onDragStart={() => {
                }}
              >
                <div className='min-w-0 flex-1'>
                  <h4 className='truncate text-xs font-medium text-gray-800 group-hover:text-blue-700'>
                    {note.title}
                  </h4>
                  <p className='mt-0.5 line-clamp-2 text-[10px] text-gray-500 group-hover:text-blue-600'>
                    {note.payload || 'Нет содержимого'}
                  </p>
                </div>
              </Draggable>
            ))}
          </div>
        </div>
      )}

      {/* Компактный вид когда свернуто */}
      {!isExpanded && (
        <div className='border-t border-gray-100 p-2'>
          <div className='flex items-center justify-between text-xs text-gray-500'>
            <span>Наведите для добавления</span>
            <div className='flex gap-1'>
              {unposedNotes.slice(0, 3).map(note => (
                <div
                  key={note.id}
                  className='h-2 w-2 cursor-help rounded-full bg-gray-300'
                  title={note.title}
                  onClick={() => onNoteSelect?.(note)}
                />
              ))}
              {unposedNotes.length > 3 && (
                <div className='flex h-2 w-2 items-center justify-center rounded-full bg-gray-200 text-[8px]'>
                  +
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
