import { useTabs } from '@/entities';
import type { Note } from '@/entities/note';
import type { FileTreeItem } from '@/entities/tab';
import { cn } from '@/shared/lib/core';
import { memo, useCallback, type FC } from 'react';
import { LinkedNotesList } from './LinkedNotesList';

interface RelatedNotesProps {
  note: Note;
  layoutId?: string;
}

export const RelatedNotes: FC<RelatedNotesProps> = memo(function RelatedNotes({
  note,
  layoutId,
}) {
  const { open, switchTo } = useTabs();
  const effectiveLayoutId = layoutId || note?.layoutId || '';

  const handleNoteSelect = useCallback(
    (selected: Note) => {
      try {
        const item: FileTreeItem = {
          id: selected.id,
          type: 'note',
          title: selected.title,
          isMain: false,
          parentId: note.layoutId || selected.layoutId,
          note: selected,
        };
        open(item);
        switchTo(`note::${selected.id}`);
      } catch (error) {
        console.warn('Failed to open related note tab', error);
      }
    },
    [note.layoutId, open, switchTo]
  );

  return (
    <div className={cn('mb-4', 'flex', 'justify-end', 'max-sm:justify-center')}>
      <div className={cn('w-full', 'max-w-md')}>
        <LinkedNotesList
          layoutId={effectiveLayoutId}
          noteId={note.id}
          onNoteSelect={handleNoteSelect}
        />
      </div>
    </div>
  );
});
