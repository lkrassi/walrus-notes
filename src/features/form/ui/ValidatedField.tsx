import type { FieldProps } from 'formik';
import { Field } from 'formik';
import React from 'react';
import { Input } from 'shared';
import cn from 'shared/lib/cn';
import { FieldError } from './FieldError';

interface ValidatedFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?:
    | 'text'
    | 'email'
    | 'tel'
    | 'url'
    | 'numeric'
    | 'decimal'
    | 'search';
  enterKeyHint?:
    | 'enter'
    | 'done'
    | 'go'
    | 'next'
    | 'previous'
    | 'search'
    | 'send';
  children?: React.ReactNode;
}

export const ValidatedField: React.FC<ValidatedFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  className = '',
  inputClassName = '',
  required = false,
  autoComplete,
  inputMode,
  enterKeyHint,
  children,
  autoFocus
}) => {
  return (
    <div className={cn('flex', 'flex-col', 'gap-3', className)}>
      <label
        htmlFor={name}
        className={cn(
          'text-secondary',
          'dark:text-dark-secondary',
          'text-sm',
          'font-medium'
        )}
      >
        {label}
      </label>
      <div className={cn('relative')}>
        <Field name={name}>
          {({ field, form }: FieldProps) => {
            const hasError =
              form.errors[name] && (form.touched[name] || form.submitCount > 0);

            return (
              <>
                <Input
                  {...field}
                  type={type}
                  id={name}
                  placeholder={placeholder}
                  variant='default'
                  className={cn(
                    'w-full',
                    'rounded-xl',
                    'border',
                    'px-4',
                    'py-3',
                    hasError
                      ? 'border-red-500'
                      : 'border-border dark:border-dark-border',
                    inputClassName
                  )}
                  inputMode={inputMode}
                  autoComplete={autoComplete}
                  enterKeyHint={enterKeyHint}
                  required={required}
                  autoFocus={autoFocus}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e);
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    field.onBlur(e);
                    form.validateField(name);
                  }}
                />
                {children}
              </>
            );
          }}
        </Field>
      </div>
      <Field name={name}>
        {({ form }: FieldProps) => {
          const showError = Boolean(
            (form.touched && (form.touched as any)[name]) ||
              form.submitCount > 0
          );

          const errorMessage =
            showError && typeof form.errors[name] === 'string'
              ? (form.errors[name] as string)
              : undefined;

          return <FieldError error={errorMessage} />;
        }}
      </Field>
    </div>
  );
};
