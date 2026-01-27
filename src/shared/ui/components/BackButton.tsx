import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type BackButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  title?: string;
  ariaLabel?: string;
};

const StyledIconButton = styled(IconButton)(({ theme }) => {
  const baseColor = theme.palette.primary.main;
  const opacity = theme.palette.mode === 'dark' ? 0.75 : 0.9;
  const shadow = `0 8px 0 0 ${alpha(baseColor, opacity)}`;
  return {
    backgroundColor: baseColor,
    color: theme.palette.primary.contrastText,
    boxShadow: shadow,
    transform: 'translateY(0)',
    transition: 'all 0.2s',
    borderRadius: '0.375rem',
    padding: '8px 28px',
    '&:hover': {
      backgroundColor: baseColor,
      boxShadow: shadow,
      filter: 'brightness(1.05)',
    },
    '&:active': {
      boxShadow: '0 0 0 0',
      transform: 'translateY(6px)',
    },
  };
});

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  className = '',
  title,
  ariaLabel,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
      return;
    }

    try {
      navigate(-1);
    } catch (_err) {
      if (typeof window !== 'undefined' && window.history.length > 0) {
        window.history.back();
      }
    }
  };

  return (
    <StyledIconButton
      onClick={handleClick}
      title={title}
      className={className}
      aria-label={ariaLabel || title || 'Back'}
    >
      <ArrowLeft size={16} />
    </StyledIconButton>
  );
};

BackButton.displayName = 'BackButton';
