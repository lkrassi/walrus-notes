import React, { useState } from 'react';
import { Button, Input } from 'shared';
import {
  useLocalization,
  useNotifications,
} from 'widgets/hooks';
import { useCreateLayoutMutation } from 'widgets/model/stores/api';
import { useModalContext } from 'widgets/ui';

interface CreateLayoutFormProps {
  onLayoutCreated?: () => void;
}

export const CreateLayoutForm = ({
  onLayoutCreated,
}: CreateLayoutFormProps) => {
  const { t } = useLocalization();
  const [title, setTitle] = useState('');
  const { showError } = useNotifications();
  const { closeModal } = useModalContext();
  const [createLayout, { isLoading }] = useCreateLayoutMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError(t('layout:enterLayoutTitle'));
      return;
    }

    try {
      await createLayout({
        title: title.trim(),
      }).unwrap();

      setTitle('');
      if (onLayoutCreated) {
        onLayoutCreated();
      }
      closeModal();
    } catch (err: any) {
      showError(t('layout:layoutCreationError'));
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
        <Input
          id='layout-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('layout:layoutTitlePlaceholder')}
          className='w-full rounded-xl border-2 px-4 py-3'
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
