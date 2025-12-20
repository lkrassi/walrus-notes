import { type Variants } from 'framer-motion';
import { Brain, Shield, Sparkles, Users, Zap } from 'lucide-react';

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

export const features = [
  {
    key: 'visualThinking',
    icon: Brain,
  },
  {
    key: 'fastOrganization',
    icon: Zap,
  },
  {
    key: 'smartConnections',
    icon: Sparkles,
  },
  {
    key: 'secureStorage',
    icon: Shield,
  },
  {
    key: 'collaboration',
    icon: Users,
  },
];
