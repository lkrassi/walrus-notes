import { openTab, switchTab } from 'app/store/slices/tabsSlice';
import { memo, useCallback, type FC } from 'react';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { useAppDispatch } from 'widgets/hooks/redux';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';
import { createTabId } from 'widgets/model/utils/tabUtils';
import { LinkedNotesList } from './LinkedNotesList';

interface RelatedNotesProps {
  note: Note;
  layoutId?: string;
}

export const RelatedNotes: FC<RelatedNotesProps> = memo(function RelatedNotes({
  note,
  layoutId,
}) {
  const dispatch = useAppDispatch();
  const effectiveLayoutId = layoutId || note?.layoutId || '';
  const linkedOutIds =
    note?.linkedWithOut ??
    (note as unknown as { linkedWith?: string[] })?.linkedWith ??
    [];
  const linkedInIds = note?.linkedWithIn ?? [];

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
        dispatch(openTab(item));
        dispatch(switchTab(createTabId('note', selected.id)));
      } catch (_e) {}
    },
    [dispatch, note.layoutId]
  );

  return (
    <div className={cn('mb-4', 'flex', 'justify-end', 'max-sm:justify-center')}>
      <div className={cn('w-full', 'max-w-md')}>
        <LinkedNotesList
          layoutId={effectiveLayoutId}
          linkedOutIds={linkedOutIds}
          linkedInIds={linkedInIds}
          onNoteSelect={handleNoteSelect}
        />
      </div>
    </div>
  );
});
