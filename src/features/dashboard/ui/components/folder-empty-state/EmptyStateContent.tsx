import React from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useIsMobile } from 'widgets/hooks/useDeviceType';
import { itemVariants, arrowVariants } from './animations';

interface EmptyStateContentProps {
  folderTitle: string;
}

export const EmptyStateContent: React.FC<EmptyStateContentProps> = ({
  folderTitle
}) => {
  const { t } = useLocalization();
  const isMobile = useIsMobile();

  return (
    <>
      <motion.h3
        variants={itemVariants}
        className={`text-text dark:text-dark-text mb-3 font-semibold ${
          isMobile ? 'text-lg' : 'text-xl'
        }`}
      >
        {folderTitle}
      </motion.h3>

      <motion.div
        variants={itemVariants}
        className={`flex justify-center items-center space-x-2 text-gray-500 ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}
      >
        <motion.span
          variants={arrowVariants}
          animate="left"
        >
          ←
        </motion.span>
        <span>{t('dashboard:selectNoteHint')}</span>
      </motion.div>
    </>
  );
};
