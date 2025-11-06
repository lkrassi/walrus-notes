import { useDeleteLayoutMutation } from 'app/store/api';
import { closeLayoutTabs } from 'app/store/slices/tabsSlice';
import React from 'react';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useAppDispatch } from 'widgets/hooks/redux';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

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
  const { t } = useLocalization();
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const dispatch = useAppDispatch();
  const [deleteLayout, { isLoading }] = useDeleteLayoutMutation();

  const handleSubmit = async (e: React.FormEvent) => {
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
          <svg
            className={cn('h-6', 'w-6', 'text-red-600', 'dark:text-red-400')}
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
            />
          </svg>
        </div>
        <h3 className={cn('heading-lg')}>{t('layout:deleteLayout')}</h3>
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
          className={cn('px-6', 'py-3')}
          disabled={isLoading}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant='escape'
          className={cn('px-6', 'py-3')}
          disabled={isLoading}
        >
          {isLoading ? t('layout:deleting') : t('layout:delete')}
        </Button>
      </div>
    </form>
  );
};
