import { useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from 'shared/ui/components/Dropdown';
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

  const handleNoteClick = (note: Note) => {
    onNoteSelect?.(note);
  };

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
    <div className='absolute top-4 right-4 z-10 w-64'>
      <Dropdown
        isOpen={isExpanded}
        onOpenChange={setIsExpanded}
        trigger={
          <DropdownTrigger className='rounded-lg p-3 transition-colors hover:bg-gray-50/80'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-semibold text-gray-700'>
                Без позиции ({unposedNotes.length})
              </span>
            </div>
          </DropdownTrigger>
        }
        contentClassName='w-64'
      >
        <DropdownContent maxHeight='max-h-48'>
          <div className='space-y-1 p-2'>
            {unposedNotes.map(note => (
              <div
                key={note.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', JSON.stringify(note));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => handleNoteClick(note)}
                className='group flex cursor-pointer items-start gap-2 rounded-md border border-transparent p-2 transition-all hover:border-blue-100 hover:bg-blue-50 hover:shadow-sm'
              >
                <div className='min-w-0 flex-1'>
                  <h4 className='truncate text-xs font-medium text-gray-800 group-hover:text-blue-700'>
                    {note.title}
                  </h4>
                  <p className='mt-0.5 line-clamp-2 text-[10px] text-gray-500 group-hover:text-blue-600'>
                    {note.payload || 'Нет содержимого'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};
