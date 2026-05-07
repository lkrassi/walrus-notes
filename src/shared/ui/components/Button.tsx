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
  primary:
    'bg-primary text-primary-foreground hover:brightness-105 active:brightness-95',
  secondary:
    'bg-secondary text-secondary-foreground hover:brightness-95 active:brightness-90',
  danger: 'bg-danger text-white hover:brightness-105',
  success: 'bg-success text-white hover:brightness-105',
  outline:
    'border border-border bg-background text-foreground hover:bg-interactive-hover active:bg-interactive-active',
  ghost:
    'bg-transparent text-foreground hover:bg-interactive-hover active:bg-interactive-active',
  disabled:
    'border border-border bg-interactive-disabled-bg text-interactive-disabled-fg cursor-not-allowed',
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
            'btn-base focus-ring relative',
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
