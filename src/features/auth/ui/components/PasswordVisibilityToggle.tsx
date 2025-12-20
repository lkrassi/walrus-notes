import React from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
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
      className={cn('w-full', 'px-2', 'py-1', `${className}`)}
      aria-label={
        isVisible ? t('common:password.hide') : t('common:password.show')
      }
    >
      {isVisible ? (
        <Eye size={18} className={cn('text-dark-text')} />
      ) : (
        <EyeOff size={18} className={cn('text-dark-text')} />
      )}
    </Button>
  );
};
