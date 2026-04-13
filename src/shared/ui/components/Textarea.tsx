import { cn } from '@/shared/lib/core';
import {
  forwardRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from 'react';

export type TextareaProps = {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  variant?: 'default' | 'error';
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      value,
      onChange,
      placeholder,
      disabled = false,
      rows = 4,
      className = '',
      variant = 'default',
      ...rest
    },
    ref
  ) => {
    const baseClasses = `
      text-base
      focus:outline-none
      disabled:bg-interactive-disabled-bg
      disabled:text-interactive-disabled-fg
      disabled:opacity-70
      disabled:cursor-not-allowed
      resize-none
      w-full
    `;

    let colorClasses = '';
    switch (variant) {
      case 'default':
        colorClasses = `
          border border-border
          bg-surface
          text-foreground
          placeholder:text-muted-foreground
          focus:ring-2
          focus:ring-ring
        `;
        break;
      case 'error':
        colorClasses = `
          border border-danger
          bg-surface
          text-foreground
          placeholder:text-danger
          focus:ring-2
          focus:ring-danger
        `;
        break;
      default:
        colorClasses = `
          border border-border
          bg-surface
          text-foreground
          placeholder:text-muted-foreground
          focus:ring-2
          focus:ring-ring
        `;
    }

    const classes = cn(baseClasses, colorClasses, className);

    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={classes}
        {...rest}
      />
    );
  }
);
