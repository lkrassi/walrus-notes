import { useCreateLayoutMutation } from 'app/store/api';
import React, { useState } from 'react';
import { Button, Input } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';
import ColorSelector from './ColorSelector';

interface CreateLayoutFormProps {
  onLayoutCreated?: () => void;
}

export const CreateLayoutForm = ({
  onLayoutCreated,
}: CreateLayoutFormProps) => {
  const { t } = useLocalization();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
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
        color,
      }).unwrap();

      setTitle('');
      if (onLayoutCreated) {
        onLayoutCreated();
      }
      closeModal();
    } catch {
      showError(t('layout:layoutCreationError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', 'p-6')}>
      <div>
        <label htmlFor='layout-title' className={cn('tw-label')}>
          {t('layout:layoutTitle')}
        </label>
        <Input
          id='layout-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('layout:layoutTitlePlaceholder')}
          className={cn('form-input', 'rounded-md')}
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div>
        <label className={cn('tw-label')}>{t('layout:chooseColor')}</label>
        <div className={cn('mt-2', 'text-center')}>
          <ColorSelector value={color} onChange={setColor} />
        </div>
      </div>

      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button
          type='button'
          onClick={closeModal}
          variant='escape'
          className={cn('btn')}
          disabled={isLoading}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant='submit'
          className={cn('btn')}
          disabled={isLoading}
        >
          {isLoading ? t('layout:creating') : t('layout:createLayout')}
        </Button>
      </div>
    </form>
  );
};
