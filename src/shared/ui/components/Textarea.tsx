import React, { forwardRef } from 'react';
import cn from 'shared/lib/cn';

export type TextareaProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  variant?: 'default' | 'error';
  ring?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

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
      ring = true,
      ...rest
    },
    ref
  ) => {
    const baseClasses = `
      px-3
      py-2
      text-base
      border
      focus:outline-none
      disabled:opacity-50
      disabled:cursor-not-allowed
      resize-none
    `;

    const ringClasses = ring ? 'focus:ring-2' : 'focus:ring-0';

    let colorClasses = '';
    switch (variant) {
      case 'default':
        colorClasses = `
          text-text dark:text-dark-text
          border-border dark:border-dark-border
          placeholder-secondary dark:placeholder-dark-secondary
          }
        `;
        break;
      case 'error':
        colorClasses = `
          text-text dark:text-dark-text
          border-red-500 dark:border-red-400
          placeholder-red-400 dark:placeholder-red-300
          }
        `;
        break;
      default:
        colorClasses = `
          text-text dark:text-dark-text
          border-border dark:border-dark-border
          placeholder-secondary dark:placeholder-dark-secondary
          }
        `;
    }

    const classes = cn(baseClasses, ringClasses, colorClasses, className);

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

Textarea.displayName = 'Textarea';

export default Textarea;
