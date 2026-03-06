import { useModalContentContext } from '@/app/providers/modal';
import { useNotifications } from '@/app/providers/notifications';
import type { AppDispatch } from '@/app/store';
import { closeLayoutTabs, useDeleteLayoutMutation } from '@/entities';
import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button } from 'shared';
import { cn } from 'shared/lib/cn';

interface DeleteLayoutFormProps {
  layoutId: string;
  layoutTitle: string;
  onLayoutDeleted?: (layoutId: string) => void;
}

export const DeleteLayoutForm = ({
  layoutId,
  layoutTitle,
  onLayoutDeleted,
}: DeleteLayoutFormProps) => {
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const dispatch = useDispatch<AppDispatch>();
  const [deleteLayout, { isLoading }] = useDeleteLayoutMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await deleteLayout({
        layoutId,
      }).unwrap();

      dispatch(closeLayoutTabs(layoutId));

      if (onLayoutDeleted) {
        onLayoutDeleted(layoutId);
      }

      closeModal();
    } catch {
      showError(t('layout:layoutDeletionError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', 'p-6')}>
      <div className={cn('text-center')}>
        <div
          className={cn(
            'mx-auto',
            'mb-4',
            'flex',
            'h-12',
            'w-12',
            'items-center',
            'justify-center',
            'rounded-full',
            'bg-red-100',
            'dark:bg-red-900/20'
          )}
        >
          <Trash2
            className={cn('h-6', 'w-6', 'text-red-600', 'dark:text-red-400')}
          />
        </div>
        <p className={cn('muted-text', 'mt-2', 'text-sm')}>
          {t('layout:deleteLayoutConfirmation', { title: layoutTitle })}
        </p>
        <p className={cn('muted-text', 'mt-1', 'text-xs')}>
          {t('layout:deleteLayoutWarning')}
        </p>
      </div>

      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button
          type='button'
          onClick={closeModal}
          variant='default'
          className={cn('btn')}
          disabled={isLoading}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant='escape'
          className={cn('btn')}
          disabled={isLoading}
        >
          {isLoading ? t('layout:deleting') : t('layout:delete')}
        </Button>
      </div>
    </form>
  );
};
