import { cn } from '@/shared/lib/core';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';

const MarkdownPreview = lazy(() =>
  import('./MarkdownPreview').then(m => ({ default: m.MarkdownPreview }))
);

import type { Note } from '@/entities/note';
import { type FC } from 'react';

interface Props {
  payload: string;
  layoutId?: string;
  note?: Note;
  isEditing: boolean;
  enterFromRight?: boolean;
}

export const NoteContentPreview: FC<Props> = ({
  payload,
  layoutId,
  note,
  isEditing,
}) => {
  const { t } = useTranslation();

  return (
    <div
      key='preview'
      className={cn('h-full', 'overflow-y-auto', 'p-4', 'bg-transparent')}
    >
      <div className={cn('prose', 'dark:prose-invert', 'max-w-none')}>
        {payload ? (
          <Suspense fallback={null}>
            <MarkdownPreview
              content={payload}
              layoutId={layoutId}
              note={note}
              showRelated={!isEditing}
            />
          </Suspense>
        ) : (
          <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
            {t('notes:emptyNoteMessage')}
          </p>
        )}
      </div>
    </div>
  );
};
