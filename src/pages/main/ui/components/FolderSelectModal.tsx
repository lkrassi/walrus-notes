import { useGetMyLayoutsQuery } from '@/entities';
import type { Layout } from '@/entities/layout';
import { cn } from '@/shared/lib/core';
import { useModalContentContext } from '@/shared/lib/react/modal';
import { Button, RenderWithState, Skeleton } from '@/shared/ui';
import { FolderIcon } from '@/shared/ui/icons/FolderIcon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FolderSelectModalProps {
  onFolderSelected: (layoutId: string) => void;
}

export const FolderSelectModal = ({
  onFolderSelected,
}: FolderSelectModalProps) => {
  const { t } = useTranslation();
  const { closeModal } = useModalContentContext();
  const {
    data: layoutsResponse,
    isLoading,
    isFetching,
  } = useGetMyLayoutsQuery();
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);

  const layouts = layoutsResponse?.data || [];
  const nonMainLayouts = layouts.filter(layout => !layout.isMain);
  const isInitialLoading = isLoading && !layoutsResponse;
  const isRefreshing = isFetching && !!layoutsResponse;

  const handleFolderClick = (layout: Layout) => {
    setSelectedLayoutId(layout.id);
  };

  const handleConfirm = () => {
    if (selectedLayoutId) {
      closeModal();
      onFolderSelected(selectedLayoutId);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <RenderWithState
      isInitialLoading={isInitialLoading}
      isRefreshing={isRefreshing}
      skeleton={
        <div className='space-y-4 p-6'>
          <Skeleton className='mx-auto h-7 w-48 max-w-full' />
          <Skeleton className='h-12 w-full rounded-xl' />
          <Skeleton className='h-12 w-full rounded-xl' />
          <Skeleton className='h-12 w-full rounded-xl' />
          <div className='flex justify-center gap-3 pt-2'>
            <Skeleton className='h-10 w-28 rounded-lg' />
            <Skeleton className='h-10 w-32 rounded-lg' />
          </div>
        </div>
      }
      overlay={
        <div className='pointer-events-none absolute inset-0' aria-hidden />
      }
      className='h-full w-full'
    >
      <div className='space-y-4 p-6'>
        {nonMainLayouts.length === 0 ? (
          <div className='space-y-4'>
            <div className='py-8 text-center'>
              <FolderIcon
                className={cn('mx-auto mb-4 h-12 w-12', 'muted-text')}
                fillColor='currentColor'
                strokeColor='currentColor'
              />
              <h3 className='muted-text mb-2 text-lg font-medium'>
                {t('main:noFoldersAvailable')}
              </h3>
              <p className='muted-text text-sm'>
                {t('main:createFolderFirst')}
              </p>
            </div>
            <div className='flex justify-center'>
              <Button onClick={handleCancel} variant='escape'>
                {t('common:cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className='text-text dark:text-dark-text mb-4 text-center text-lg font-semibold'>
              {t('main:selectFolder') || 'Выберите папку'}
            </h3>

            <div className='max-h-96 space-y-2 overflow-y-auto'>
              {nonMainLayouts.map(layout => {
                const isSelected = selectedLayoutId === layout.id;
                const iconColor = layout.color || '#3b82f6';

                return (
                  <button
                    key={layout.id}
                    onClick={() => handleFolderClick(layout)}
                    className={cn(
                      'flex w-full items-center gap-3 border-2 p-3',
                      'cursor-pointer transition-all focus:outline-none',
                      isSelected
                        ? [
                            'border-primary bg-primary/10 dark:bg-primary/20',
                            'ring-primary/20 ring-2',
                          ]
                        : [
                            'border-gray-200 dark:border-gray-700',
                            'bg-white dark:bg-gray-800',
                            'hover:border-gray-300 dark:hover:border-gray-600',
                            'dark:hover:bg-gray-750 hover:bg-gray-50',
                          ]
                    )}
                  >
                    <FolderIcon
                      className='h-5 w-5'
                      fillColor={isSelected ? iconColor : `${iconColor}80`}
                    />

                    <div className='min-w-0 flex-1 text-left'>
                      <h4 className='text-text dark:text-dark-text truncate font-medium'>
                        {layout.title}
                      </h4>
                    </div>

                    {isSelected && (
                      <div className='bg-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                        <svg
                          className='h-3 w-3 text-white'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={3}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className='flex justify-center gap-3 pt-2'>
              <Button
                onClick={handleCancel}
                variant='escape'
                className={cn('btn')}
              >
                {t('common:cancel') || 'Отмена'}
              </Button>
              <Button
                onClick={handleConfirm}
                variant={selectedLayoutId ? 'submit' : 'disabled'}
                disabled={!selectedLayoutId}
                className={cn('btn')}
              >
                {t('common:confirm') || 'Подтвердить'}
              </Button>
            </div>
          </>
        )}
      </div>
    </RenderWithState>
  );
};
