import { useCreateLayoutMutation } from 'app/store/api';
import React, { useState } from 'react';
import { Button, Input } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';
import CircularColorPicker from './CircularColorPicker';
import { Folder, Plus, Trash2 } from 'lucide-react';

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
        <div className={cn('mt-2')}>
          <CircularColorPicker value={color} onChange={setColor} size={200} />
        </div>
        <div className={cn('mt-3')}>
          <div
            className={cn(
              'flex',
              'items-center',
              'justify-between',
              'gap-2',
              'rounded-lg',
              'py-2',
              'px-3',
              'w-full'
            )}
            style={
              color
                ? { backgroundColor: color }
                : {
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }
            }
            aria-hidden
          >
            <div
              className={cn(
                'flex',
                'items-center',
                'gap-2',
                'w-full',
                'overflow-hidden'
              )}
            >
              <Folder
                className={cn('h-4', 'w-4', 'shrink-0')}
                style={{ color: '#ffffff' }}
              />
              <span
                title={title || t('layout:layoutTitlePlaceholder')}
                className={cn(
                  'flex-1',
                  'min-w-0',
                  'truncate',
                  'text-sm',
                  'font-medium'
                )}
                style={{ color: '#ffffff' }}
              >
                {title || t('layout:layoutTitlePlaceholder')}
              </span>
            </div>

            <div className={cn('flex', 'items-center', 'gap-2')}>
              <button type='button' aria-hidden className={cn('p-1')}>
                <Plus
                  className={cn('h-4', 'w-4')}
                  style={{ color: '#ffffff' }}
                />
              </button>
              <button type='button' aria-hidden className={cn('p-1')}>
                <Trash2
                  className={cn('h-4', 'w-4')}
                  style={{ color: '#ffffff' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('flex', 'justify-end', 'gap-3')}>
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
