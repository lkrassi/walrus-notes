import { forwardRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import cn from 'shared/lib/cn';
import { useTheme } from 'widgets/hooks';
import type { Note } from 'shared/model/types/layouts';
import RelatedNotesDropdown from './RelatedNotesDropdown';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  note?: Note;
  layoutId?: string;
  showRelated?: boolean;
}

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  if (inline)
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  return (
    <pre
      className={cn(
        'm-0',
        'overflow-x-auto',
        'p-4',
        'bg-gray-50',
        'dark:bg-gray-900',
        'rounded-lg'
      )}
    >
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, className, note, layoutId, showRelated = true }, ref) => {
    const { theme } = useTheme();

    useEffect(() => {
      if (theme === 'dark') import('highlight.js/styles/github-dark.css');
      else import('highlight.js/styles/github.css');
    }, [theme]);

    return (
      <div
        ref={ref}
        className={cn('relative', 'h-full', 'overflow-y-auto', className)}
      >
        {showRelated && note && (
          <RelatedNotesDropdown note={note} layoutId={layoutId} />
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
            'mt-15'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{ code: CodeBlock }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
);

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
