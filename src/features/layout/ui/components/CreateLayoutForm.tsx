import { Button, Input } from '@/shared';
import { cn } from '@/shared/lib/core';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateLayoutForm } from '../../model/useCreateLayoutForm';
import { ColorSelector } from './ColorSelector';

interface CreateLayoutFormProps {
  onLayoutCreated?: () => void;
}

export const CreateLayoutForm = ({
  onLayoutCreated,
}: CreateLayoutFormProps) => {
  const { t } = useTranslation();
  const {
    title,
    color,
    isLoading,
    closeModal,
    setTitle,
    setColor,
    handleSubmit,
    isSubmitDisabled,
  } = useCreateLayoutForm({ onLayoutCreated });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
