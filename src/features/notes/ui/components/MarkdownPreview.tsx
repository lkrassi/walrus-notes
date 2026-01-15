import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import cn from 'shared/lib/cn';
import CodeHighlighter from './CodeHighlighter';
import type { Note } from 'shared/model/types/layouts';
import LinkedNotesList from './LinkedNotesList';
import { useAppDispatch } from 'widgets/hooks/redux';
import { openTab, switchTab } from 'app/store/slices/tabsSlice';
import { createTabId } from 'widgets/model/utils/tabUtils';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  note?: Note;
  layoutId?: string;
  showRelated?: boolean;
}

// Компонент для безопасного рендера ссылок
const SafeLink: React.FC<{
  href?: string;
  title?: string;
  children?: React.ReactNode;
}> = ({ href = '', title, children }) => {
  // Проверяем, что это безопасная URL
  if (
    !href.startsWith('http://') &&
    !href.startsWith('https://') &&
    !href.startsWith('mailto:') &&
    !href.startsWith('#')
  ) {
    return <span>{children}</span>;
  }
  return (
    <a
      href={href}
      title={title}
      rel='noopener noreferrer'
      target={href.startsWith('http') ? '_blank' : undefined}
    >
      {children}
    </a>
  );
};

const SafeImage: React.FC<{
  src?: string;
  alt?: string;
  title?: string;
}> = ({ src = '', alt, title }) => {
  if (
    !src.startsWith('http://') &&
    !src.startsWith('https://') &&
    !src.startsWith('data:')
  ) {
    return <span className='text-red-500'>[Unsafe image URL: {alt}]</span>;
  }
  return <img src={src} alt={alt} title={title} loading='lazy' />;
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

  return (
    <code className={cn('block-code', className)} {...props}>
      {children}
    </code>
  );
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, className, note, layoutId, showRelated = true }, ref) => {
    const dispatch = useAppDispatch();
    const effectiveLayoutId = layoutId || note?.layoutId || '';
    const linkedOutIds =
      note?.linkedWithOut ??
      (note as unknown as { linkedWith?: string[] })?.linkedWith ??
      [];
    const linkedInIds = note?.linkedWithIn ?? [];
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
          <div
            className={cn(
              'mb-4',
              'flex',
              'justify-end',
              'max-sm:justify-center'
            )}
          >
            <div className={cn('w-full', 'max-w-md')}>
              <LinkedNotesList
                layoutId={effectiveLayoutId}
                linkedOutIds={linkedOutIds}
                linkedInIds={linkedInIds}
                onNoteSelect={(selected: Note) => {
                  try {
                    const item: FileTreeItem = {
                      id: selected.id,
                      type: 'note',
                      title: selected.title,
                      isMain: false,
                      parentId: note.layoutId || selected.layoutId,
                      note: selected,
                    };
                    dispatch(openTab(item));
                    dispatch(switchTab(createTabId('note', selected.id)));
                  } catch (_e) {}
                }}
              />
            </div>
          </div>
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
            'dark:text-dark-text'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              pre: PreBlock,
              a: SafeLink,
              img: SafeImage,
            }}
            skipHtml={true}
            allowedElements={[
              'p',
              'br',
              'strong',
              'em',
              'u',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'blockquote',
              'code',
              'pre',
              'hr',
              'ul',
              'ol',
              'li',
              'a',
              'img',
              'table',
              'thead',
              'tbody',
              'tr',
              'th',
              'td',
              'del',
              'input',
            ]}
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
