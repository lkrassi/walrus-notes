import { Settings } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/components/Button';

export const SettingsButton: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  return (
    <Button
      variant='default'
      onClick={handleOpenSettings}
      className='flex h-10 w-5 items-center justify-center px-8 py-5'
      title='Настройки'
    >
      <span>
        {' '}
        <Settings size={18} />
      </span>
    </Button>
  );
};
