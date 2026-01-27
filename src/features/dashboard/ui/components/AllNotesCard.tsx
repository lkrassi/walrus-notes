import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { cn } from 'shared/lib/cn';
import type { Layout } from 'shared/model/types/layouts';
import { useLocalization } from 'widgets/hooks/useLocalization';

interface AllNotesCardProps {
  layout: Layout;
  onFolderClick?: (layoutId: string, title: string) => void;
  itemVariants: Variants;
}

export const AllNotesCard = ({
  layout,
  onFolderClick,
  itemVariants,
}: AllNotesCardProps) => {
  const { t } = useLocalization();

  return (
    <motion.div variants={itemVariants} initial='hidden' animate='visible'>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onFolderClick?.(layout.id, layout.title || 'All Notes')}
        className={cn(
          'w-full',
          'rounded-xl',
          'bg-gradient-to-br',
          'from-primary',
          'to-primary-dark',
          'dark:from-dark-primary',
          'dark:to-dark-primary-dark',
          'p-6',
          'text-left',
          'transition-all',
          'duration-300',
          'cursor-pointer',
          'shadow-lg',
          'hover:shadow-xl'
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-4')}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: 'linear',
            }}
            className={cn(
              'bg-white/20',
              'dark:bg-white/10',
              'rounded-full',
              'p-3',
              'shrink-0'
            )}
          >
            <Network className='h-8 w-8 text-white' />
          </motion.div>

          <div className={cn('min-w-0', 'flex-1')}>
            <h3
              className={cn(
                'font-bold',
                'text-white',
                'truncate',
                'text-lg',
                'mb-1'
              )}
            >
              {t('dashboard:allNotes') || 'Общий граф'}
            </h3>
            <p className={cn('text-white/80', 'text-sm')}>
              {t('dashboard:allNotesDescription') ||
                'Все заметки из всех папок'}
            </p>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};
