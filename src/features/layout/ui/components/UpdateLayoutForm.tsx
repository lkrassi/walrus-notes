import React, { useState } from 'react';
import { useUpdateLayoutMutation } from 'app/store/api';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';
import CircularColorPicker from './CircularColorPicker';
import { Input } from 'shared';
import { Trash2, Plus } from 'lucide-react';
import FolderIcon from 'shared/ui/icons/FolderIcon';

interface UpdateLayoutFormProps {
  layoutId: string;
  layoutTitle?: string;
  layoutColor?: string;
  onLayoutUpdated?: (
    layoutId: string,
    data?: { title?: string; color?: string }
  ) => void;
}

export const UpdateLayoutForm: React.FC<UpdateLayoutFormProps> = ({
  layoutId,
  layoutTitle = '',
  layoutColor = undefined,
  onLayoutUpdated,
}) => {
  const { t } = useLocalization();
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [updateLayout, { isLoading }] = useUpdateLayoutMutation();

  const [title, setTitle] = useState(layoutTitle);
  const [color, setColor] = useState<string | undefined>(layoutColor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLayout({
        layoutId,
        title: title || undefined,
        color,
      }).unwrap();
      if (onLayoutUpdated)
        onLayoutUpdated(layoutId, { title: title || undefined, color });
      closeModal();
    } catch (_e) {
      showError(t('layout:updateError') || 'Failed to update layout');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', 'p-6')}>
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
              <div
                className={cn(
                  'h-6',
                  'w-6',
                  'flex',
                  'items-center',
                  'justify-center',
                  'rounded-full',
                  'transition-colors',
                  'duration-200'
                )}
              >
                <FolderIcon
                  className={cn('h-6', 'w-6')}
                  fillColor={color}
                />
              </div>

              <span
                title={title || t('layout:layoutTitlePlaceholder')}
                className={cn(
                  'flex-1',
                  'min-w-0',
                  'truncate',
                  'text-sm',
                  'font-medium'
                )}
              >
                {title || t('layout:layoutTitlePlaceholder')}
              </span>
            </div>

            <div className={cn('flex', 'items-center', 'gap-2')}>
              <button type='button' aria-hidden className={cn('p-1')}>
                <Plus
                  className={cn('h-4', 'w-4')}
                />
              </button>
              <button type='button' aria-hidden className={cn('p-1')}>
                <Trash2
                  className={cn('h-4', 'w-4')}
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

export default UpdateLayoutForm;
