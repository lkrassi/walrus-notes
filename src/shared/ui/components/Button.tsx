import { cn } from '@/shared/lib/core';
import {
  forwardRef,
  memo,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

export type ButtonVariant = 'default' | 'disabled' | 'escape' | 'submit';

export type ButtonProps = {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  to?: string;
  title?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

const variantClasses: Record<ButtonVariant, string> = {
  default: cn(
    'bg-btn',
    'text-white',
    'hover:brightness-105',
    'dark:bg-dark-btn',
    'dark:text-white'
  ),
  disabled: cn(
    'bg-btn-disabled',
    'text-text',
    'dark:bg-dark-btn-disabled',
    'dark:text-dark-text'
  ),
  escape: cn(
    'bg-btn-cancel',
    'text-white',
    'hover:brightness-105',
    'dark:bg-dark-btn-cancel'
  ),
  submit: cn(
    'bg-btn-submit',
    'text-white',
    'hover:brightness-105',
    'dark:bg-dark-btn-submit'
  ),
};

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
      const navigate = useNavigate();

      const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (onClick) {
          onClick(e);
        }
        if (to) {
          const isExternal = /^(https?:\/\/|mailto:|tel:)/.test(to);
          if (isExternal) {
            window.location.href = to;
          } else {
            navigate(to);
          }
        }
      };

      return (
        <button
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'relative rounded-md px-4 py-1 text-base font-semibold transition-all duration-200',
            'disabled:cursor-not-allowed disabled:brightness-90',
            variantClasses[variant],
            className
          )}
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
