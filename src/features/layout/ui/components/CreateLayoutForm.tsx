import { createLayout } from 'features/layout/api';
import React, { useState } from 'react';
import { Button } from 'shared';
import {
  useAppDispatch,
  useLocalization,
  useModalContext,
  useNotifications,
} from 'widgets';

interface CreateLayoutFormProps {
  onLayoutCreated?: () => void;
}

export const CreateLayoutForm = ({
  onLayoutCreated,
}: CreateLayoutFormProps) => {
  const { t } = useLocalization();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const { closeModal } = useModalContext();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError(t('layout:enterLayoutTitle'));
      return;
    }

    setIsLoading(true);

    try {
      await createLayout(
        {
          title: title.trim(),
        },
        dispatch
      );

      showSuccess(t('layout:layoutCreatedSuccess'));
      setTitle('');
      onLayoutCreated?.();
      closeModal();
    } catch (err: any) {
      showError(t('layout:layoutCreationError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 p-6'>
      <div>
        <label
          htmlFor='layout-title'
          className='text-text dark:text-dark-text mb-2 block text-sm font-medium'
        >
          {t('layout:layoutTitle')}
        </label>
        <input
          id='layout-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('layout:layoutTitlePlaceholder')}
          className='border-border dark:border-dark-border text-text dark:text-dark-text placeholder-input-placeholder dark:placeholder-dark-input-placeholder focus:ring-primary dark:focus:ring-dark-primary w-full rounded-lg border bg-white px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 dark:bg-gray-800'
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          onClick={closeModal}
          variant='escape'
          className='px-6 py-3'
          disabled={isLoading}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant='submit'
          className='px-6 py-3'
          disabled={isLoading}
        >
          {isLoading ? t('layout:creating') : t('layout:createLayout')}
        </Button>
      </div>
    </form>
  );
};
