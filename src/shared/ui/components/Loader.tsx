import { motion, type Transition } from 'framer-motion';
import { type FC } from 'react';
import { cn } from 'shared/lib/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const Loader: FC<LoaderProps> = ({ size = 'md', className, text }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-4 w-4',
  };

  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.15,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const dotVariants = {
    start: {
      y: '0%',
      scale: 1,
    },
    end: {
      y: '-100%',
      scale: 1.2,
    },
  };

  const dotTransition: Transition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: [0.4, 0.0, 0.2, 1],
  };

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center gap-4',
        className
      )}
    >
      <motion.div
        className={cn(
          'relative flex items-center justify-center gap-2',
          sizeClasses[size]
        )}
        variants={containerVariants}
        initial='start'
        animate='end'
      >
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            className={cn(
              'rounded-full',
              dotSizes[size],
              'from-primary via-primary to-primary-dark bg-linear-to-br',
              'dark:from-dark-primary dark:via-dark-primary dark:to-primary-gradient',
              'shadow-primary/50 dark:shadow-primary/30 shadow-lg'
            )}
            variants={dotVariants}
            transition={dotTransition}
          />
        ))}
      </motion.div>
      {text && (
        <motion.p
          className={cn(
            'text-sm font-medium',
            'text-secondary dark:text-dark-secondary',
            'animate-pulse'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
