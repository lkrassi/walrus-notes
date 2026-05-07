import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/core';

/**
 * IconButton Component
 *
 * A reusable icon button with multiple size and variant options.
 * Replaces 31+ duplicated icon button patterns throughout the codebase.
 *
 * @example
 * <IconButton icon={<TrashIcon />} variant="outline" size="md" onClick={handleDelete} />
 */

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element to render */
  icon?: ReactNode;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual style variant */
  variant?: 'ghost' | 'outline' | 'solid';
  /** Whether button is in active state */
  isActive?: boolean;
}

const SIZES = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

const VARIANTS = {
  ghost:
    'border-transparent bg-transparent text-text hover:bg-interactive-hover dark:text-dark-secondary dark:hover:bg-dark-secondary/20 dark:hover:text-dark-text',
  outline: 'btn-icon-tone-default',
  solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon, size = 'md', variant = 'outline', isActive, className, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn-icon-base focus-ring',
          'duration-150',
          SIZES[size],
          VARIANTS[variant],
          isActive && 'bg-interactive-selected text-text dark:text-dark-text',
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
