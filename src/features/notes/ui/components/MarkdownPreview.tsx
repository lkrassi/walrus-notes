import { forwardRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import cn from 'shared/lib/cn';
import { useTheme } from 'widgets/hooks';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

// Кастомный компонент для блоков кода
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  // Prefer language from the AST node (what user wrote after ```),
  // fallback to className like `language-js` added by rehype/highlight.
  let language = '';
  if (node && (node as any).lang) {
    language = (node as any).lang;
  } else if (className) {
    const match = className.match(/language-(\S+)/i);
    language = match ? match[1] : '';
  }

  const isInline = inline || !language;

  if (isInline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className='relative my-4'>
      {language && (
        <div
          className={cn(
            'absolute',
            'right-2',
            'top-0',
            'transform',
            '-translate-y-1/2',
            'flex',
            'items-center',
            'gap-2',
            'z-2'
          )}
        >
          <span
            className={cn(
              'bg-gray-100',
              'dark:bg-gray-800',
              'text-gray-600',
              'dark:text-gray-300',
              'text-xs',
              'font-mono',
              'px-2',
              'py-0.5',
              'rounded-full',
              'border',
              'border-gray-200',
              'dark:border-gray-700',
              'tracking-wider',
              'z-10',
              'shadow-sm'
            )}
          >
            {language}
          </span>
        </div>
      )}
      <pre
        className={cn(
          'm-0 overflow-x-auto',
          language ? 'px-4 pt-8 pb-4' : 'p-4',
          'bg-gray-50 dark:bg-gray-900',
          'rounded-lg'
        )}
      >
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, className }, ref) => {
    const { theme } = useTheme();

    useEffect(() => {
      if (theme === 'dark') {
        import('highlight.js/styles/github-dark.css');
      } else {
        import('highlight.js/styles/github.css');
      }
    }, [theme]);

    return (
      <div ref={ref} className={cn('h-full', 'overflow-y-auto', className)}>
        <div
          className={cn(
            'prose',
            'dark:prose-invert',
            'max-w-none',
            'p-0',
            'wrap-break-word',
            'markdown-content',
            'text-text',
            'dark:text-dark-text'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code: CodeBlock,
            }}
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
