import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { useLocalization } from 'widgets/hooks/useLocalization';
import {
  descriptionVariants,
  emptyStateVariants,
  iconVariants,
  titleVariants,
} from './animations';

interface EmptyLayoutStateProps {
  layoutTitle?: string;
}

export const EmptyLayoutState = ({
  layoutTitle = 'Папка',
}: EmptyLayoutStateProps) => {
  const { t } = useLocalization();

  return (
    <div className='bg-bg dark:bg-dark-bg flex h-full w-full items-center justify-center'>
      <motion.div
        variants={emptyStateVariants}
        initial='hidden'
        animate='visible'
        className='mx-auto max-w-md px-6 text-center'
      >
        <motion.div
          variants={iconVariants}
          initial='hidden'
          animate='visible'
          className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
        >
          <FolderOpen className='h-12 w-12 text-green-600 dark:text-green-400' />
        </motion.div>

        <motion.h2
          variants={titleVariants}
          initial='hidden'
          animate='visible'
          className='text-text dark:text-dark-text mb-3 text-2xl font-bold'
        >
          {t('notes:folderEmpty')}
        </motion.h2>

        <motion.p
          variants={descriptionVariants}
          initial='hidden'
          animate='visible'
          className='text-secondary dark:text-dark-secondary mb-8'
        >
          {t('notes:folderEmptyDescription').replace('{layoutTitle}', layoutTitle)}
        </motion.p>
      </motion.div>
    </div>
  );
};
