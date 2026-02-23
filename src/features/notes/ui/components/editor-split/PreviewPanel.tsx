import { motion } from 'framer-motion';
import { Suspense, lazy, memo, type FC } from 'react';
import { Loader } from 'shared';
import { cn } from 'shared/lib/cn';
import type { PreviewPanelProps } from './types';

const MarkdownPreview = lazy(() =>
  import('../MarkdownPreview').then(m => ({ default: m.MarkdownPreview }))
);

export const PreviewPanel: FC<PreviewPanelProps> = memo(function PreviewPanel({
  payload,
  isEditing,
  isDesktop,
  note,
  layoutId,
  previewRef,
}) {
  return (
    <motion.div
      layout
      layoutId='preview-panel'
      initial={false}
      animate={{
        x: 0,
        opacity: 1,
        transition: {
          duration: 0.15,
          ease: 'easeOut',
        },
      }}
      transition={{
        layout: { duration: 0.15, ease: 'easeOut' },
      }}
      className={cn(
        'flex-1',
        'h-full',
        'min-h-0',
        'border-border',
        'dark:border-dark-border',
        isDesktop ? 'border-l' : 'border-t',
        'p-4',
        'bg-transparent',
        !isDesktop && 'basis-1/2',
        !isDesktop && 'min-h-0'
      )}
    >
      <Suspense
        fallback={
          <div
            className={cn('flex', 'items-center', 'justify-center', 'h-full')}
          >
            <Loader size='md' />
          </div>
        }
      >
        <MarkdownPreview
          ref={previewRef}
          content={payload}
          note={note}
          layoutId={layoutId}
          showRelated={!isEditing}
        />
      </Suspense>
    </motion.div>
  );
});
