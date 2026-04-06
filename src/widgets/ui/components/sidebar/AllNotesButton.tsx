import { cn } from '@/shared/lib/core';
import { useLocalization } from '@/widgets/hooks/useLocalization';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';

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
                {t('main:allNotes')}
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
        'px-2',
        'py-1',
        'min-h-7',
        'rounded-none',
        'text-left',
        'text-[13px]',
        'flex',
        'items-center',
        'gap-2',
        isSelected
          ? cn(
              'bg-interactive-selected',
              'text-foreground',
              'dark:bg-primary/45',
              'dark:text-white'
            )
          : cn('hover:bg-interactive-hover')
      )}
      title={t('main:allNotes')}
    >
      <Network className='h-3.5 w-3.5 shrink-0' />
      <span className='truncate font-normal'>{t('main:allNotes')}</span>
    </button>
  );
};
