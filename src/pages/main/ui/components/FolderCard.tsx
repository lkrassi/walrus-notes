import type { Layout } from '@/entities/layout';
import { DeleteLayoutForm, UpdateLayoutForm } from '@/features/layout';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react/modal';
import { FolderIcon } from '@/shared/ui/icons/FolderIcon';
import { Network, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFolderCardData } from '../../model/useFolderCardData';

interface FolderCardProps {
  layout: Layout;
  onFolderClick?: (layoutId: string, title: string) => void;
}

export const FolderCard = ({ layout, onFolderClick }: FolderCardProps) => {
  const { t } = useTranslation();
  const { openModalFromTrigger } = useModalActions();
  const { data } = useFolderCardData({ layoutId: layout.id });
  const notesCount = data?.notesCount || 0;

  const handleEdit = openModalFromTrigger(
    <UpdateLayoutForm
      layoutId={layout.id}
      layoutTitle={layout.title}
      layoutColor={layout.color}
    />,
    {
      title: t('layout:updateLayoutData') || 'Редактировать папку',
      size: MODAL_SIZE_PRESETS.layoutUpdate,
      showCloseButton: true,
    }
  );

  const handleDelete = openModalFromTrigger(
    <DeleteLayoutForm
      layoutId={layout.id}
      layoutTitle={layout.title || 'Untitled'}
    />,
    {
      title: t('layout:deleteLayout'),
      size: MODAL_SIZE_PRESETS.layoutDelete,
      showCloseButton: true,
    }
  );

  return (
    <div key={layout.id}>
      <div
        onClick={() => onFolderClick?.(layout.id, layout.title || 'Untitled')}
        className={cn(
          'w-full',
          'bg-white',
          'dark:bg-gray-800',
          'p-4',
          'text-left',
          'transition-all',
          'duration-300',
          'border',
          'border-border',
          'dark:border-dark-border',
          'cursor-pointer',
          'relative',
          'group'
        )}
      >
        <div className={cn('flex', 'items-start', 'gap-3')}>
          <div className={cn('mt-1', 'shrink-0')}>
            {layout.isMain ? (
              <Network className='text-primary dark:text-dark-primary h-6 w-6' />
            ) : (
              <FolderIcon
                fillColor={layout.color || '#4F46E5'}
                className='h-6 w-6'
              />
            )}
          </div>

          <div className={cn('min-w-0', 'flex-1')}>
            <h3
              className={cn(
                'font-semibold',
                'text-text',
                'dark:text-dark-text',
                'truncate',
                'text-sm'
              )}
            >
              {layout.title || 'Untitled Folder'}
            </h3>
            {!layout.isMain && (
              <p
                className={cn(
                  'muted-text',
                  'dark:text-dark-secondary',
                  'text-xs',
                  'mt-1'
                )}
              >
                {notesCount}{' '}
                {notesCount === 1 ? t('main:note') : t('main:notes')}
              </p>
            )}
          </div>

          <div
            className={cn(
              'flex',
              'gap-1',
              'shrink-0',
              'md:opacity-0',
              'md:group-hover:opacity-100',
              'transition-opacity',
              'duration-200'
            )}
          >
            <button
              onClick={e => {
                e.stopPropagation();
                handleEdit(e);
              }}
              className={cn(
                'p-1.5',
                'rounded-md',
                'bg-primary/10',
                'dark:bg-dark-primary/10',
                'text-primary',
                'dark:text-dark-primary',
                'hover:bg-primary/20',
                'dark:hover:bg-dark-primary/20',
                'transition-colors'
              )}
              title={t('layout:editLayout') || 'Редактировать'}
            >
              <Pencil className='h-3.5 w-3.5' />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                handleDelete(e);
              }}
              className={cn(
                'p-1.5',
                'rounded-md',
                'bg-red-100',
                'dark:bg-red-900/20',
                'text-red-600',
                'dark:text-red-400',
                'hover:bg-red-200',
                'dark:hover:bg-red-900/40',
                'transition-colors'
              )}
              title={t('layout:deleteLayout') || 'Удалить'}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
