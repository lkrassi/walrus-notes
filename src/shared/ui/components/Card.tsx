import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/core';

/**
 * Card Component
 *
 * A flexible container with consistent styling and optional interactive behavior.
 * Replaces 20+ nearly identical card wrappers throughout the codebase.
 *
 * @example
 * <Card isInteractive onClick={handleClick}>
 *   <div>Card content</div>
 * </Card>
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to render inside card */
  children: ReactNode;
  /** Enable interactive styles (hover effect, cursor pointer) */
  isInteractive?: boolean;
  /** Add padding to card */
  hasPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, isInteractive, hasPadding = true, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card-base',
          isInteractive && 'interactive',
          hasPadding && 'p-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
