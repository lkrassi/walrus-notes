import {
  allowedMarkdownElements,
  markdownComponents,
} from '@/features/notes/lib/markdownConfig';
import { cn } from '@/shared/lib/cn';
import type { Note } from '@/shared/model/types/layouts';
import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RelatedNotes } from './RelatedNotes';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  note?: Note;
  layoutId?: string;
  showRelated?: boolean;
}

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, className, note, layoutId, showRelated = true }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          'h-full',
          'min-h-0',
          'overflow-y-auto',
          className
        )}
      >
        {showRelated && note && (
          <RelatedNotes note={note} layoutId={layoutId} />
        )}

        <div
          className={cn(
            'prose',
            'dark:prose-invert',
            'max-w-none',
            'p-0',
            'wrap-break-word',
            'markdown-content',
            'text-text',
            'dark:text-dark-text',
            !showRelated && 'pt-12.5'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
            skipHtml={true}
            allowedElements={allowedMarkdownElements as unknown as string[]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
);
