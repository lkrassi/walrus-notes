import { cn } from '@/shared/lib/core';
import {
  forwardRef,
  memo,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

type SemanticButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'outline'
  | 'ghost';
type LegacyButtonVariant = 'default' | 'disabled' | 'escape' | 'submit';
export type ResolvedButtonVariant = SemanticButtonVariant | 'disabled';

export type ButtonVariant = SemanticButtonVariant | LegacyButtonVariant;

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

const variantClasses: Record<ResolvedButtonVariant, string> = {
  primary: cn(
    'bg-primary',
    'text-primary-foreground',
    'hover:brightness-105',
    'active:brightness-95'
  ),
  secondary: cn(
    'bg-secondary',
    'text-secondary-foreground',
    'hover:brightness-95',
    'active:brightness-90'
  ),
  danger: cn('bg-danger', 'text-white', 'hover:brightness-105'),
  success: cn('bg-success', 'text-white', 'hover:brightness-105'),
  outline: cn(
    'border',
    'border-border',
    'bg-background',
    'text-foreground',
    'hover:bg-interactive-hover',
    'active:bg-interactive-active'
  ),
  ghost: cn(
    'bg-transparent',
    'text-foreground',
    'hover:bg-interactive-hover',
    'active:bg-interactive-active'
  ),
  disabled: cn(
    'border',
    'border-border',
    'bg-interactive-disabled-bg',
    'text-interactive-disabled-fg',
    'cursor-not-allowed'
  ),
};

const legacyVariantMap: Record<LegacyButtonVariant, ResolvedButtonVariant> = {
  default: 'primary',
  escape: 'danger',
  submit: 'success',
  disabled: 'disabled',
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
      const baseVariant =
        variant in legacyVariantMap
          ? legacyVariantMap[variant as LegacyButtonVariant]
          : (variant as ResolvedButtonVariant);
      const resolvedVariant: ResolvedButtonVariant = disabled
        ? 'disabled'
        : baseVariant;

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
            'relative px-4 py-1 text-base font-semibold transition-all duration-200',
            'focus-visible:ring-ring focus-visible:ring-2',
            'disabled:cursor-not-allowed',
            variantClasses[resolvedVariant],
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
