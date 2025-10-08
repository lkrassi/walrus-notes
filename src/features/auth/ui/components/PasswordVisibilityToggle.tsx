import React from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from 'shared';

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
      className={`${className} bg-btn-bg hover:bg-btn-hover flex items-center justify-center w-9 h-8 max-sm:w-8 max-sm:h-7`}
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
