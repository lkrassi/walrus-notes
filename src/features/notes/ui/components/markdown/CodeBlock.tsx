import { cn } from '@/shared/lib/core';
import { memo, type ReactNode } from 'react';

export const CodeBlock = memo(function CodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}) {
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
});
