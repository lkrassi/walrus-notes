import { motion } from 'framer-motion';
import { FileText, Network } from 'lucide-react';
import { useGetNotesQuery } from 'app/store/api';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks/useLocalization';
import FolderIcon from 'shared/ui/icons/FolderIcon';
import type { Layout } from 'shared/model/types/layouts';
import type { Variants } from 'framer-motion';

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
  const { data: notesResponse } = useGetNotesQuery({
    layoutId: layout.id,
    page: 1,
  });

  const notesCount = notesResponse?.data?.length || 0;

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
          'dark:bg-dark-card',
          'p-4',
          'text-left',
          'transition-all',
          'duration-300',
          'border',
          'border-border',
          'dark:border-dark-border',
          'cursor-pointer'
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
              <Network className='text-accent dark:text-dark-accent h-6 w-6' />
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

          <motion.div
            initial={{ x: -5, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            className={cn('text-accent', 'dark:text-dark-accent', 'shrink-0')}
          >
            <FileText className='h-4 w-4' />
          </motion.div>
        </div>
      </motion.button>
    </motion.div>
  );
};
