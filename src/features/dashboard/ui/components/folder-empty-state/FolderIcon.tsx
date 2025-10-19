import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from 'widgets/hooks/useDeviceType';
import { itemVariants, pulseVariants, dotVariants } from './animations';

export const FolderIcon: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      variants={itemVariants}
      className={`text-secondary dark:text-dark-secondary mx-auto mb-6 relative ${
        isMobile ? 'h-16 w-16' : 'h-20 w-20'
      }`}
    >
      <motion.div
        variants={pulseVariants}
        animate="pulse"
      >
        <svg viewBox='0 0 24 24' fill='currentColor'>
          <path d='M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z' />
        </svg>
      </motion.div>

      <motion.div
        className={`absolute bg-green-400 rounded-full ${
          isMobile ? 'top-0.5 right-1.5 w-1.5 h-1.5' : 'top-1 right-2 w-2 h-2'
        }`}
        variants={dotVariants}
        animate="blink"
      />
    </motion.div>
  );
};
