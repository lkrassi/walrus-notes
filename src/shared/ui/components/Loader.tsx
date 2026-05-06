import { cn } from '@/shared/lib/core';
import { motion } from 'framer-motion';
import { type FC } from 'react';

interface LoaderProps {
  className?: string;
}

export const Loader: FC<LoaderProps> = ({ className }) => {
  return (
    <div
      role='status'
      aria-live='polite'
      className={cn(
        'flex h-full w-full items-center justify-center',
        className
      )}
    >
      <div className='relative h-56 w-56'>
        {/* Core */}
        <motion.div
          className='bg-primary/80 absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-lg'
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Soft field */}
        <motion.div
          className='bg-primary/5 absolute inset-0 rounded-full blur-3xl'
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Orbit paths */}
        <svg className='absolute inset-0 h-full w-full'>
          <circle
            cx='50%'
            cy='50%'
            r='70'
            className='stroke-border/40 dark:stroke-dark-border/40'
            fill='none'
          />
          <circle
            cx='50%'
            cy='50%'
            r='40'
            className='stroke-border/30 dark:stroke-dark-border/30'
            fill='none'
          />
        </svg>

        {/* Orbiting nodes */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className='bg-primary absolute h-3 w-3 rounded-full'
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${40 + i * 15}px 0px`,
            }}
          />
        ))}

        {/* Signal pulses */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={`pulse-${i}`}
            className='bg-primary absolute top-1/2 left-1/2 h-2 w-2 rounded-full'
            initial={{ x: 0, y: 0 }}
            animate={{
              x: [0, (i - 1) * 60, 0],
              y: [0, i % 2 === 0 ? 50 : -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Outer sync ring */}
        <motion.div
          className='border-primary/20 absolute inset-0 rounded-full border'
          animate={{
            scale: [1, 1.3],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
        />
      </div>
    </div>
  );
};
