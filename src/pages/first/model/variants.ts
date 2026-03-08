import {
  AutoAwesome,
  FlashOn,
  People,
  Psychology,
  Security,
} from '@mui/icons-material';
import { type Variants } from 'framer-motion';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.8,
    },
  },
};

export const containerVariantsMobile: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.4,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export const itemVariantsMobile: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export const featureVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'backOut',
    },
  },
};

export const featureVariantsMobile: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

export const features = [
  {
    key: 'visualThinking',
    icon: Psychology,
  },
  {
    key: 'fastOrganization',
    icon: FlashOn,
  },
  {
    key: 'smartConnections',
    icon: AutoAwesome,
  },
  {
    key: 'secureStorage',
    icon: Security,
  },
  {
    key: 'collaboration',
    icon: People,
  },
];
