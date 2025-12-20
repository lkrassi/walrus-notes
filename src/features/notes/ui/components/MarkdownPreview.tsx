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
    const dispatch = useAppDispatch();
    const effectiveLayoutId = layoutId || note?.layoutId || '';
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
            <div className={cn('w-56')}>
              <LinkedNotesList
                layoutId={effectiveLayoutId}
                linkedIds={note.linkedWith || []}
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
