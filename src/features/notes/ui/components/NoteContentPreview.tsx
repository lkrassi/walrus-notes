import { cn } from '@/shared/lib';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from 'shared';

const MarkdownPreview = lazy(() =>
  import('./MarkdownPreview').then(m => ({ default: m.MarkdownPreview }))
);

import type { Note } from '@/shared/model';
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
          <Suspense
            fallback={
              <div className={cn('min-h-50', 'space-y-3')}>
                <Skeleton className='h-7 w-3/5' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-11/12' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-4 w-full' />
              </div>
            }
          >
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
