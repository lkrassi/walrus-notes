import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useLocalization } from '@/widgets/hooks/useLocalization';

interface AllNotesButtonProps {
  onAllNotesClick?: () => void;
  isSelected?: boolean;
  variant?: 'compact' | 'card';
  itemVariants?: Variants;
}

export const AllNotesButton = ({
  onAllNotesClick,
  isSelected,
  variant = 'compact',
  itemVariants,
}: AllNotesButtonProps) => {
  const { t } = useLocalization();

  if (variant === 'card') {
    return (
      <motion.div variants={itemVariants} initial='hidden' animate='visible'>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAllNotesClick}
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
                {t('main:allNotes') || 'Общий граф'}
              </h3>
              <p className={cn('text-white/80', 'text-sm')}>
                {t('main:allNotesDescription')}
              </p>
            </div>
          </div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <button
      onClick={onAllNotesClick}
      className={cn(
        'w-full',
        'px-3',
        'py-2',
        'rounded',
        'text-left',
        'text-sm',
        'flex',
        'items-center',
        'gap-2',
        'transition-colors',
        isSelected
          ? cn(
              'bg-primary',
              'text-white',
              'dark:bg-dark-primary',
              'dark:text-dark-text'
            )
          : cn(
              'text-text',
              'dark:text-dark-text',
              'hover:bg-gray-200',
              'dark:hover:bg-gray-800'
            )
      )}
      title={t('main:allNotes')}
    >
      <Network className='h-4 w-4 shrink-0' />
      <span className='truncate font-medium'>{t('main:allNotes')}</span>
    </button>
  );
};
