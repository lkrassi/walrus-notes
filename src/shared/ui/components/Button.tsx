import React, { forwardRef, memo } from 'react';
import cn from 'shared/lib/cn';

export type ButtonVariant = 'default' | 'disabled' | 'escape' | 'submit';

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  to?: string;
  title?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        children,
        onClick,
        type = 'button',
        disabled = false,
        variant = 'default',
        className = '',
        to,
        title,
        ...restProps
      }: ButtonProps,
      ref
    ) => {
      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (onClick) {
          onClick(e);
        }
        if (to) {
          window.location.href = to;
        }
      };

      const getVariantClasses = () => {
        const baseClasses = `
          relative
          text-white
          text-base
          font-semibold
          cursor-pointer
          disabled:cursor-not-allowed
          transition-all
          duration-200
          transform
          translate-y-0
          shadow-[0_8px_0_0]
          rounded-md
          active:shadow-[0_0_0_0]
          active:translate-y-1.5
          disabled:shadow-[0_8px_0_0]
          disabled:active:shadow-[0_8px_0_0]
          disabled:active:translate-y-0
        `;

        let bgColor = '';
        let shadowColor = '';

        switch (variant) {
          case 'default':
            bgColor = 'bg-btn';
            shadowColor = 'shadow-btn/90 dark:shadow-btn/75';
            break;
          case 'escape':
            bgColor = 'bg-btn-cancel';
            shadowColor = 'shadow-btn-cancel/75 dark:shadow-btn-cancel/75';
            break;
          case 'submit':
            bgColor = 'bg-btn-submit';
            shadowColor = 'shadow-btn-submit/75 dark:shadow-btn-submit/75';
            break;
          case 'disabled':
            bgColor = 'bg-btn-disabled';
            shadowColor = 'shadow-btn-disabled/75 dark:shadow-btn-disabled/75';
            break;
          default:
            bgColor = 'bg-btn';
            shadowColor = 'shadow-btn/90 dark:shadow-btn/75';
        }

        return `${baseClasses} ${bgColor} ${shadowColor}`;
      };

      const baseClasses = getVariantClasses();

      return (
        <button
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(baseClasses, className)}
          onClick={handleClick}
          title={title}
          {...restProps}
        >
          {children}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';
