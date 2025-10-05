import { useState } from 'react';

import { useNotifications } from 'widgets';

import { createLayout } from 'features/layout/api';
import { Button } from 'shared';

export const CreateLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const handleCreateLayout = async () => {
    setIsLoading(true);

    try {
      await createLayout({
        title: 'Мой новый layout',
      });

      showSuccess('Layout создан успешно');
    } catch (err: any) {
      showError('Произошла ошибка при создании layout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <Button className='p-4' onClick={handleCreateLayout} disabled={isLoading}>
        {isLoading ? 'Создание...' : 'Создать layout'}
      </Button>
    </div>
  );
};
