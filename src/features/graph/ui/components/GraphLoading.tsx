import { motion } from 'framer-motion';
import React from 'react';

export const GraphLoading: React.FC = () => {
  const loadingVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const dotVariants = {
    initial: { scale: 0, y: 0 },
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      y: [0, -10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 0.5,
        delay: i * 0.2,
        ease: 'easeInOut' as const,
      },
    }),
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      className='flex h-full w-full items-center justify-center from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900'
      variants={containerVariants}
      initial='initial'
      animate='animate'
    >
      <motion.div
        className='text-center'
        variants={loadingVariants}
        initial='initial'
        animate='animate'
      >
        <motion.div
          className='mb-4 text-4xl'
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          🦦
        </motion.div>

        <motion.h3
          className='mb-6 text-xl font-semibold text-gray-700 dark:text-gray-200'
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Загружаем ваш граф...
        </motion.h3>

        <div className='flex justify-center gap-2'>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className='h-3 w-3 rounded-full bg-blue-500'
              custom={i}
              variants={dotVariants}
              initial='initial'
              animate='animate'
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
