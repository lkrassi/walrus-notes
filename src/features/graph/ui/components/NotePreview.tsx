import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { useTranslation } from 'react-i18next';
import { graphTheme } from '../../lib/utils';

interface NotePreviewProps {
  note: Note;
  layoutColor?: string;
  isDrag?: boolean;
  isSmall?: boolean;
  linkCount?: number;
  className?: string;
}

const getLinkCount = (note: Note) => {
  const links = new Set([
    ...(note.linkedWithIn ?? []),
    ...(note.linkedWithOut ?? []),
  ]);

  return links.size;
};

export const NotePreview = ({
  note,
  layoutColor,
  isDrag = false,
  linkCount,
  className,
}: NotePreviewProps) => {
  const { t } = useTranslation();
  const palette = graphTheme();
  const resolvedColor = layoutColor ?? palette.edge;
  const resolvedLinkCount = linkCount ?? getLinkCount(note);

  const title = note.title?.trim() || t('notes:untitled');

  return (
    <div
      className={cn(
        'cursor-grab active:cursor-grabbing',
        'border-border/75 bg-bg/94 text-text relative flex flex-col gap-1 overflow-hidden rounded-xl border py-2 pr-5 pl-2 text-left',
        'transition-[transform,border-color,opacity] duration-200 ease-out',
        'dark:border-dark-border/80 dark:bg-dark-bg/92 dark:text-dark-text',
        isDrag && 'scale-[1.015]',
        className
      )}
      style={{
        borderColor: resolvedColor,
      }}
    >
      <div
        className='absolute inset-0 opacity-80 dark:opacity-100'
        aria-hidden
      />
      <p className='relative z-10 line-clamp-2 overflow-hidden pr-2 text-left font-semibold'>
        {title}
      </p>
      <div className='note-preview-meta'>
        <span className='inline-flex items-center gap-1 uppercase'>
          {t('notes:graphNodeLinks', { count: resolvedLinkCount })}
        </span>
      </div>
    </div>
  );
};
