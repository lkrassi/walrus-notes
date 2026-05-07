import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/core';

/**
 * FormInput Component
 *
 * A flexible form input with support for icons, errors, and consistent styling.
 * Replaces 15+ duplicated form input patterns throughout the codebase.
 *
 * @example
 * <FormInput
 *   placeholder="Search..."
 *   icon={<SearchIcon />}
 *   error={errors.name}
 * />
 */

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display below input */
  error?: string;
  /** Icon element to display inside input (left side) */
  icon?: ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, icon, className, ...props }, ref) => {
    return (
      <div className='w-full'>
        <div className='relative'>
          <input
            ref={ref}
            className={cn(
              'input-base',
              icon && 'pl-9',
              error && 'error',
              className
            )}
            {...props}
          />
          {icon && (
            <div className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2'>
              {icon}
            </div>
          )}
        </div>
        {error && <p className='text-destructive mt-1 text-xs'>{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
