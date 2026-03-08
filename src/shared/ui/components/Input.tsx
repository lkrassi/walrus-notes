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
    }: InputProps,
    ref
  ) => {
    const isError = variant === 'error';

    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange as never}
        onBlur={onBlur as never}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-base transition-all duration-200 outline-none',
          'border-border text-text placeholder-input-placeholder bg-bg',
          'dark:border-dark-border dark:text-dark-text dark:placeholder-dark-input-placeholder dark:bg-dark-bg',
          ring
            ? 'focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent focus:ring-2'
            : 'focus:border-primary dark:focus:border-dark-primary',
          isError && 'border-red-500 focus:ring-red-500 dark:border-red-400',
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
      />
    );
  }
);
