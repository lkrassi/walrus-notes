import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import cn from 'shared/lib/cn';
import CodeHighlighter from './CodeHighlighter';
// theme not required for plain code blocks
import type { Note } from 'shared/model/types/layouts';
import RelatedNotesDropdown from './RelatedNotesDropdown';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  note?: Note;
  layoutId?: string;
  showRelated?: boolean;
}

const CodeBlock = ({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  if (inline)
    return (
      <code className={cn('inline-code', className)} {...props}>
        {children}
      </code>
    );

  return <CodeHighlighter className={className}>{children}</CodeHighlighter>;
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, className, note, layoutId, showRelated = true }, ref) => {
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
