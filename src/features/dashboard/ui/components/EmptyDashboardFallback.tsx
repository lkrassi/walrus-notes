import { useGetMyLayoutsQuery } from 'app/store/api';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from 'shared/lib/cn';
import type { Layout } from 'shared/model/types/layouts';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { AllNotesCard } from './AllNotesCard';
import { FolderCard } from './FolderCard';

interface EmptyDashboardFallbackProps {
  onFolderClick?: (layoutId: string, title: string) => void;
  onCreateClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const EmptyDashboardFallback = ({
  onFolderClick,
  onCreateClick,
}: EmptyDashboardFallbackProps) => {
  const { t } = useLocalization();
  const { data: layoutsResponse } = useGetMyLayoutsQuery();

  const layouts: Layout[] = layoutsResponse?.data || [];

  const mainLayout = layouts.find(layout => layout.isMain);
  const regularLayouts = layouts.filter(layout => !layout.isMain);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardHoverVariants = {
    rest: { scale: 1, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' },
    hover: {
      scale: 1.02,
      boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.15)',
    },
  };

  const isEmpty = regularLayouts.length === 0;

  if (!layoutsResponse) {
    return null;
  }

  return (
    <div
      className={cn(
        'h-full',
        'overflow-y-auto',
        'bg-bg',
        'dark:bg-dark-bg',
        'p-4',
        'md:p-6'
      )}
    >
      <motion.div
        key={layouts.length}
        className={cn(
          'mx-auto',
          'max-w-2xl',
          'flex',
          'flex-col',
          'items-center',
          'justify-center',

          isEmpty ? 'h-full' : 'py-8'
        )}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        style={{ opacity: 0 }}
      >
        {mainLayout && (
          <div className={cn('w-full', 'mb-8')}>
            <AllNotesCard
              layout={mainLayout}
              onFolderClick={onFolderClick}
              itemVariants={itemVariants}
            />
          </div>
        )}

        {isEmpty ? (
          <>
            <motion.div
              variants={itemVariants}
              className={cn(
                'text-center',
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'mb-8'
              )}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className={cn(
                  'mb-6',
                  'text-primary',
                  'dark:text-dark-primary',
                  'rounded-full',
                  'bg-primary/10',
                  'dark:bg-dark-primary/10',
                  'p-4'
                )}
              >
                <Plus className='h-12 w-12' />
              </motion.div>

              <h2
                className={cn(
                  'text-2xl',
                  'font-bold',
                  'text-text',
                  'dark:text-dark-text',
                  'mb-3'
                )}
              >
                {t('dashboard:noFolders') || 'Нет папок'}
              </h2>

              <p
                className={cn(
                  'text-secondary',
                  'dark:text-dark-secondary',
                  'max-w-xs',
                  'text-sm'
                )}
              >
                {t('dashboard:createFolderDescription') ||
                  'Создайте свою первую папку, чтобы начать организовывать заметки'}
              </p>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              variants={itemVariants}
              className={cn('mb-8', 'text-center')}
            >
              <h2
                className={cn(
                  'text-2xl',
                  'font-bold',
                  'text-text',
                  'dark:text-dark-text',
                  'mb-2'
                )}
              >
                {t('dashboard:myFolders') || 'Мои папки'}
              </h2>
              <p
                className={cn(
                  'text-secondary',
                  'dark:text-dark-secondary',
                  'text-sm'
                )}
              >
                {regularLayouts.length}{' '}
                {regularLayouts.length === 1
                  ? t('dashboard:folder') || 'папка'
                  : t('dashboard:folders') || 'папок'}{' '}
              </p>
            </motion.div>

            <motion.div
              className={cn(
                'grid',
                'w-full',
                'gap-4',
                'grid-cols-1',
                'sm:grid-cols-2',
                'md:grid-cols-3'
              )}
            >
              {regularLayouts.map((layout: Layout) => (
                <FolderCard
                  key={layout.id}
                  layout={layout}
                  onFolderClick={onFolderClick}
                  itemVariants={itemVariants}
                  cardHoverVariants={cardHoverVariants}
                />
              ))}
            </motion.div>
          </>
        )}

        <motion.button
          variants={itemVariants}
          initial='hidden'
          animate='visible'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateClick}
          className={cn(
            'mt-8',
            'flex',
            'items-center',
            'gap-2',
            'rounded-lg',
            'border-2',
            'border-dashed',
            'border-primary',
            'dark:border-dark-primary',
            'px-6',
            'py-3',
            'font-medium',
            'text-primary',
            'dark:text-dark-primary',
            'transition-all',
            'duration-200',
            'hover:bg-primary/10',
            'dark:hover:bg-dark-primary/10'
          )}
        >
          <Plus className='h-5 w-5' />
          {t('layout:createLayout') || 'Создать папку'}
        </motion.button>
      </motion.div>
    </div>
  );
};
