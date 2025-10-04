import { useState } from 'react';
import { useNotifications } from 'widgets';
import { Button } from '../../../../shared';
import { createLayout } from '../../api/createLayout';

export const CreateLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const handleCreateLayout = async () => {
    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await createLayout({
        title: 'Мой новый layout',
      });

      setSuccess(true);
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
