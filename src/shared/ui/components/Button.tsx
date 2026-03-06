import MuiButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';
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

const StyledButton = styled(MuiButton, {
  shouldForwardProp: prop => prop !== 'buttonVariant',
})<{ buttonVariant: ButtonVariant }>(({ theme, buttonVariant }) => {
  const getVariantStyles = () => {
    const mode = theme.palette.mode;
    const isDisabledVariant = buttonVariant === 'disabled';

    const mutedBg =
      mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];

    const baseColor = isDisabledVariant
      ? mutedBg
      : buttonVariant === 'default'
        ? theme.palette.primary.main
        : buttonVariant === 'escape'
          ? theme.palette.error.main
          : buttonVariant === 'submit'
            ? theme.palette.success.main
            : theme.palette.action.disabledBackground;

    return {
      backgroundColor: baseColor,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: baseColor,
        boxShadow: 'none',
        filter: isDisabledVariant ? 'none' : 'brightness(1.05)',
      },
      '&:active': {
        boxShadow: 'none',
        transform: 'none',
      },
      color: isDisabledVariant ? theme.palette.text.primary : '#ffffff',
      '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
        cursor: 'not-allowed',
        boxShadow: 'none',
        '&:active': {
          boxShadow: 'none',
          transform: 'none',
        },
      },
    };
  };

  return {
    position: 'relative',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s, filter 0.2s, color 0.2s',
    transform: 'none',
    borderRadius: '0.375rem',
    textTransform: 'none',
    padding: '4px 16px',
    ...getVariantStyles(),
  };
});

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
        <StyledButton
          ref={ref}
          type={type}
          disabled={disabled}
          buttonVariant={variant}
          className={className}
          onClick={handleClick}
          title={title}
          {...restProps}
        >
          {children}
        </StyledButton>
      );
    }
  )
);
