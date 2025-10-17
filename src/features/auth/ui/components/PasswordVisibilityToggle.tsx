import React from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from 'shared';
import { useLocalization } from 'widgets/hooks';

type PasswordVisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
};

export const PasswordVisibilityToggle: React.FC<
  PasswordVisibilityToggleProps
> = ({ isVisible, onToggle, className = '' }) => {
  const { t } = useLocalization();
  return (
    <Button
      type='button'
      onClick={onToggle}
      className={`${className} bg-btn-bg hover:bg-btn-hover flex h-8 w-9 items-center justify-center`}
      aria-label={
        isVisible ? t('common:password.hide') : t('common:password.show')
      }
    >
      {isVisible ? (
        <Eye size={18} className='text-dark-text' />
      ) : (
        <EyeOff size={18} className='text-dark-text' />
      )}
    </Button>
  );
};
