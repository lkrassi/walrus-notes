import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
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
  enterFromRight = false,
}) => {
  const { t } = useLocalization();

  const initialX = enterFromRight ? 120 : -120;
  return (
    <motion.div
      key='preview'
      initial={{ x: initialX, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ duration: 0.22 }}
      className={cn('h-full', 'overflow-y-auto', 'p-4', 'bg-transparent')}
    >
      <div className={cn('prose', 'dark:prose-invert', 'max-w-none')}>
        {payload ? (
          <Suspense fallback={<div className={cn('p-4')}>{payload}</div>}>
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
    </motion.div>
  );
};
