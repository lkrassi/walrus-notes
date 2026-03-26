import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLinkedNotes } from '../../lib/hooks';
import { LinkedNotesDropdown } from './LinkedNotesDropdown';

interface LinkedNotesListProps {
  layoutId?: string | null;
  linkedInIds?: string[];
  linkedOutIds?: string[];
  onNoteSelect?: (note: Note) => void;
}

export const LinkedNotesList = ({
  layoutId,
  linkedInIds = [],
  linkedOutIds = [],
  onNoteSelect,
}: LinkedNotesListProps) => {
  const { t } = useTranslation();
  const [isExpandedIn, setIsExpandedIn] = useState(false);
  const [isExpandedOut, setIsExpandedOut] = useState(false);

  const { linkedNotesIn, linkedNotesOut, isLoading } = useLinkedNotes({
    layoutId,
    linkedInIds,
    linkedOutIds,
  });

  const handleNoteClick = useCallback(
    (note: Note) => {
      const noteWithLayout = { ...note, layoutId } as Note;
      onNoteSelect?.(noteWithLayout);
      setIsExpandedIn(false);
      setIsExpandedOut(false);
    },
    [layoutId, onNoteSelect]
  );

  if (!layoutId) return null;

  return (
    <div
      className={cn(
        'relative',
        'flex',
        'gap-2',
        'w-full',
        'max-w-full',
        'items-start'
      )}
    >
      <LinkedNotesDropdown
        label={t('common:links.outgoing', {
          count: linkedNotesOut.length,
        })}
        notes={linkedNotesOut}
        layoutId={layoutId}
        isLoading={isLoading}
        isOpen={isExpandedOut}
        onOpenChange={setIsExpandedOut}
        onNoteClick={handleNoteClick}
        emptyMessage={t('common:links.noConnections')}
      />

      <LinkedNotesDropdown
        label={t('common:links.incoming', {
          count: linkedNotesIn.length,
        })}
        notes={linkedNotesIn}
        layoutId={layoutId}
        isLoading={isLoading}
        isOpen={isExpandedIn}
        onOpenChange={setIsExpandedIn}
        onNoteClick={handleNoteClick}
        emptyMessage={t('common:links.noConnections')}
      />
    </div>
  );
};
