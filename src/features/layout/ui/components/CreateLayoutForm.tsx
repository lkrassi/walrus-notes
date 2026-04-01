import { useCreateLayoutMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { Button, Input } from '@/shared';
import { cn } from '@/shared/lib/core';
import { useModalContentContext } from '@/shared/lib/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorSelector } from './ColorSelector';

interface CreateLayoutFormProps {
  onLayoutCreated?: () => void;
}

export const CreateLayoutForm = ({
  onLayoutCreated,
}: CreateLayoutFormProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const DEFAULT_COLOR = '#3b82f6';
  const [color, setColor] = useState<string | undefined>(DEFAULT_COLOR);
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [createLayout, { isLoading }] = useCreateLayoutMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError(t('layout:enterLayoutTitle'));
      return;
    }

    try {
      await createLayout({
        title: title.trim(),
        color: color || DEFAULT_COLOR,
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

  const isSubmitDisabled = isLoading || !title.trim() || !color;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', 'p-6')}>
      <div>
        <label htmlFor='layout-title' className={cn('tw-label')}>
          {t('layout:layoutTitle')}
        </label>
        <Input
          ref={inputRef}
          id='layout-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('layout:layoutTitlePlaceholder')}
          className={cn('form-input')}
          disabled={isLoading}
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
          variant={isSubmitDisabled ? 'disabled' : 'submit'}
          className={cn('btn')}
          disabled={isSubmitDisabled}
        >
          {isLoading ? t('layout:creating') : t('layout:createLayout')}
        </Button>
      </div>
    </form>
  );
};
