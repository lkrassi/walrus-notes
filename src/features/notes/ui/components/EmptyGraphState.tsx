import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useFileTree } from 'widgets/hooks';
import {
  descriptionVariants,
  emptyStateVariants,
  iconVariants,
  titleVariants,
} from './animations';

interface EmptyGraphStateProps {
  layoutTitle?: string;
  layoutId?: string;
}

export const EmptyGraphState = ({
  layoutTitle = 'Папка',
  layoutId,
}: EmptyGraphStateProps) => {
  const { t } = useLocalization();
  const { fileTree } = useFileTree();

  // Найти название папки по layoutId
  const layout = fileTree.find(item => item.id === layoutId);
  const actualLayoutTitle = layout ? layout.title : layoutTitle;

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
          className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
        >
          <FileText className='h-12 w-12 text-blue-600 dark:text-blue-400' />
        </motion.div>

        <motion.h2
          variants={titleVariants}
          initial='hidden'
          animate='visible'
          className='text-text dark:text-dark-text mb-3 text-2xl font-bold'
        >
          {t('notes:graphEmpty')}
        </motion.h2>

        <motion.p
          variants={descriptionVariants}
          initial='hidden'
          animate='visible'
          className='text-secondary dark:text-dark-secondary mb-8'
        >
          {t('notes:graphEmptyDescription').replace(
            '{layoutTitle}',
            actualLayoutTitle
          )}
        </motion.p>
      </motion.div>
    </div>
  );
};
