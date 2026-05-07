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
          'input-base',
          !ring && 'focus:border-ring focus:ring-0',
          isError && 'error',
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
