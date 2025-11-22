import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import cn from 'shared/lib/cn';
import CodeHighlighter from './CodeHighlighter';
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

  // For block code we don't render here; the `pre` handler will render it.
  return (
    <code className={cn('block-code', className)} {...props}>
      {children}
    </code>
  );
};

const PreBlock: React.FC<React.HTMLAttributes<HTMLPreElement>> = props => {
  const { children } = props;
  const child = Array.isArray(children) ? children[0] : children;
  if (child && child.props) {
    const className = child.props.className;
    const code = child.props.children;
    return <CodeHighlighter className={className}>{code}</CodeHighlighter>;
  }

  return <pre>{children}</pre>;
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
            components={{ code: CodeBlock, pre: PreBlock }}
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
