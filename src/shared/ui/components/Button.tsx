import MuiButton from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import { forwardRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';

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
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

const StyledButton = styled(MuiButton, {
  shouldForwardProp: prop => prop !== 'buttonVariant',
})<{ buttonVariant: ButtonVariant }>(({ theme, buttonVariant }) => {
  const getVariantStyles = () => {
    const mode = theme.palette.mode;
    const opacity = mode === 'dark' ? 0.75 : 0.9;
    const isDisabledVariant = buttonVariant === 'disabled';

    const mutedBg =
      mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];
    const mutedShadow = alpha(
      mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[500],
      mode === 'dark' ? 0.4 : 0.25
    );

    const baseColor = isDisabledVariant
      ? mutedBg
      : buttonVariant === 'default'
        ? theme.palette.primary.main
        : buttonVariant === 'escape'
          ? theme.palette.error.main
          : buttonVariant === 'submit'
            ? theme.palette.success.main
            : theme.palette.action.disabledBackground;

    const shadowColor = isDisabledVariant
      ? mutedShadow
      : alpha(baseColor, opacity);
    const disabledShadow = alpha(
      theme.palette.mode === 'dark'
        ? theme.palette.grey[700]
        : theme.palette.grey[400],
      opacity
    );

    return {
      backgroundColor: baseColor,
      boxShadow: `0 8px 0 0 ${shadowColor}`,
      '&:hover': {
        backgroundColor: baseColor,
        boxShadow: `0 8px 0 0 ${shadowColor}`,
        filter: isDisabledVariant ? 'none' : 'brightness(1.05)',
      },
      '&:active': {
        boxShadow: '0 0 0 0',
        transform: 'translateY(6px)',
      },
      color: isDisabledVariant ? theme.palette.text.primary : '#ffffff',
      '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
        cursor: 'not-allowed',
        boxShadow: `0 8px 0 0 ${disabledShadow}`,
        '&:active': {
          boxShadow: `0 8px 0 0 ${disabledShadow}`,
          transform: 'translateY(0)',
        },
      },
    };
  };

  return {
    position: 'relative',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    transform: 'translateY(0)',
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

      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

Button.displayName = 'Button';
