import { cn } from '@/shared/lib/core';
import type { InputProps } from '@/shared/model/inputProps';
import { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder,
      type = 'text',
      disabled = false,
      variant = 'default',
      ring = true,
      className = '',
      autoFocus = false,
      maxLength,
      minLength,
      required = false,
      name,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...rest
    }: InputProps,
    ref
  ) => {
    const isError = variant === 'error';

    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full border px-3 py-2 text-base transition-all duration-200 outline-none',
          'border-border bg-surface text-foreground placeholder:text-muted-foreground',
          'disabled:bg-interactive-disabled-bg disabled:text-interactive-disabled-fg',
          ring
            ? 'focus:ring-ring focus:border-transparent focus:ring-2'
            : 'focus:border-ring',
          isError && 'border-danger focus:ring-danger',
          className
        )}
        autoFocus={autoFocus}
        required={required}
        name={name}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...rest}
      />
    );
  }
);
