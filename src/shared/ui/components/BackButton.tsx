import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'shared/lib/cn';
import { Button } from './Button';

export type BackButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  title?: string;
  ariaLabel?: string;
};

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
    <Button
      onClick={handleClick}
      variant='default'
      title={title}
      className={cn(
        'flex',
        'h-10',
        'w-5',
        'items-center',
        'justify-center',
        'px-7',
        'py-2',
        className
      )}
      aria-label={ariaLabel || title || 'Back'}
    >
      <span>
        <ArrowLeft className={cn('h-4 w-4')} />
      </span>
    </Button>
  );
};

BackButton.displayName = 'BackButton';
