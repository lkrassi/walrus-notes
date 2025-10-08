import type { Transition, Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  initial: {
    y: 60,
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const floatAnimation: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const slideInFromLeft: Variants = {
  initial: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export const slideInFromRight: Variants = {
  initial: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export const circleScaleIn = (delay: number = 0): Variants => ({
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      delay,
      duration: 0.8,
      ease: 'easeOut',
    },
  },
});

export const featureItemHover: Variants = {
  hover: {
    x: 8,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};

export const gradientTextSpring: { transition: Transition } = {
  transition: {
    type: 'spring' as const,
    stiffness: 300,
  },
};
