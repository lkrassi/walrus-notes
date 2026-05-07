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
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          'input-base resize-none',
          variant === 'error' && 'error placeholder:text-danger',
          className
        )}
        {...rest}
      />
    );
  }
);
