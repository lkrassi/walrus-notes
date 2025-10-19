import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from 'widgets/hooks/useDeviceType';
import { floatingVariants } from './animations';

export const FloatingIcons: React.FC = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return (
    <>
      <motion.div
        className="absolute -top-8 -left-8 text-blue-400 opacity-60"
        variants={floatingVariants}
        animate="float"
        style={{ rotate: -15 }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      </motion.div>

      <motion.div
        className="absolute -top-4 -right-6 text-green-400 opacity-50"
        variants={floatingVariants}
        animate="float"
        style={{ rotate: 10 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      </motion.div>

      <motion.div
        className="absolute -bottom-6 -left-6 text-purple-400 opacity-40"
        variants={floatingVariants}
        animate="float"
        style={{ rotate: -5 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/>
        </svg>
      </motion.div>
    </>
  );
};
