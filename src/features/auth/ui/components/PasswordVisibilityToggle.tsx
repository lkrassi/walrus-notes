import React from 'react';

import { Button } from 'shared';
import { Eye, EyeOff } from 'lucide-react';

type PasswordVisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
};

export const PasswordVisibilityToggle: React.FC<
  PasswordVisibilityToggleProps
> = ({ isVisible, onToggle, className = '' }) => {
  return (
    <Button
      type='button'
      onClick={onToggle}
      variant='default'
      className={`${className} bg-btn-bg hover:bg-btn-hover px-2 py-1 flex justify-center items-center`}
      aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
    >
      {isVisible ? (
        <Eye size={18} className='text-dark-text' />
      ) : (
        <EyeOff size={18} className='text-dark-text' />
      )}
    </Button>
  );
};
