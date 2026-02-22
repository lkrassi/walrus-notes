import { useGetNotesQuery } from 'app/store/api';
import { DeleteLayoutForm } from 'features/layout/ui/components/DeleteLayoutForm';
import { UpdateLayoutForm } from 'features/layout/ui/components/UpdateLayoutForm';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Network, Pencil, Trash2 } from 'lucide-react';
import { cn } from 'shared/lib/cn';
import type { Layout } from 'shared/model/types/layouts';
import { FolderIcon } from 'shared/ui/icons/FolderIcon';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useModalActions } from 'widgets/hooks/useModalActions';

interface FolderCardProps {
  layout: Layout;
  onFolderClick?: (layoutId: string, title: string) => void;
  itemVariants: Variants;
  cardHoverVariants: Record<string, { scale: number; boxShadow: string }>;
}

export const FolderCard = ({
  layout,
  onFolderClick,
  itemVariants,
  cardHoverVariants,
}: FolderCardProps) => {
  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();
  const { data: notesResponse } = useGetNotesQuery({
    layoutId: layout.id,
    page: 1,
  });

  const notesCount = notesResponse?.data?.length || 0;

  const handleEdit = openModalFromTrigger(
    <UpdateLayoutForm
      layoutId={layout.id}
      layoutTitle={layout.title}
      layoutColor={layout.color}
    />,
    {
      title: t('layout:updateLayoutData') || 'Редактировать папку',
      size: 'md',
      showCloseButton: true,
    }
  );

  const handleDelete = openModalFromTrigger(
    <DeleteLayoutForm
      layoutId={layout.id}
      layoutTitle={layout.title || 'Untitled'}
    />,
    {
      title: t('layout:deleteLayout') || 'Удалить папку',
      size: 'md',
      showCloseButton: true,
    }
  );

  return (
    <motion.div
      key={layout.id}
      variants={itemVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.button
        variants={cardHoverVariants}
        initial='rest'
        whileHover='hover'
        onClick={() => onFolderClick?.(layout.id, layout.title || 'Untitled')}
        className={cn(
          'w-full',
          'rounded-xl',
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
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              delay: Math.random() * 2,
            }}
            className={cn('mt-1', 'shrink-0')}
          >
            {layout.isMain ? (
              <Network className='text-primary dark:text-dark-primary h-6 w-6' />
            ) : (
              <FolderIcon
                fillColor={layout.color || '#4F46E5'}
                className='h-6 w-6'
              />
            )}
          </motion.div>

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
                  'text-secondary',
                  'dark:text-dark-secondary',
                  'text-xs',
                  'mt-1'
                )}
              >
                {notesCount}{' '}
                {notesCount === 1
                  ? t('dashboard:note') || 'заметка'
                  : t('dashboard:notes') || 'заметок'}
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
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
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
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
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
            </motion.button>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};
