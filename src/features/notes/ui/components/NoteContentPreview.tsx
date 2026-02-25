import { Suspense, lazy } from 'react';
import { Loader } from 'shared';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets';

const MarkdownPreview = lazy(() =>
  import('./MarkdownPreview').then(m => ({ default: m.MarkdownPreview }))
);

import { type FC } from 'react';
import type { Note } from 'shared/model/types/layouts';

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
  const { t } = useLocalization();

  return (
    <div
      key='preview'
      className={cn('h-full', 'overflow-y-auto', 'p-4', 'bg-transparent')}
    >
      <div className={cn('prose', 'dark:prose-invert', 'max-w-none')}>
        {payload ? (
          <Suspense
            fallback={
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'justify-center',
                  'min-h-50'
                )}
              >
                <Loader size='md' />
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
