import { CodeHighlighter } from '@/features/notes/ui/components/CodeHighlighter';
import { memo, type FC, type HTMLAttributes, type ReactNode } from 'react';

export const PreBlock: FC<HTMLAttributes<HTMLPreElement>> = memo(
  function PreBlock(props) {
    const { children } = props as { children?: ReactNode };
    const child = Array.isArray(children) ? children[0] : children;
    if (child && child.props) {
      const className = child.props.className;
      const code = child.props.children;
      return <CodeHighlighter className={className}>{code}</CodeHighlighter>;
    }

    return <pre>{children}</pre>;
  }
);
