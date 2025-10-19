import { type Variants, easeInOut } from 'framer-motion';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export const floatingVariants: Variants = {
  float: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: easeInOut
    }
  }
};

export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: easeInOut
    }
  }
};

export const dotVariants: Variants = {
  blink: {
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: easeInOut,
      delay: 1
    }
  }
};

export const arrowVariants: Variants = {
  left: {
    x: [0, 5, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: easeInOut
    }
  },
  right: {
    x: [0, -5, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: easeInOut,
      delay: 0.5
    }
  }
};
