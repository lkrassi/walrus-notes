import {
  circleScaleIn,
  floatAnimation,
  slideInFromRight,
} from 'features/main/models';
import { motion } from 'framer-motion';

export const HeroRight: React.FC = () => {
  return (
    <motion.div
      variants={slideInFromRight}
      initial='initial'
      animate='animate'
      className='relative order-1 lg:order-2'
    >
      <motion.div
        variants={floatAnimation}
        initial='initial'
        animate='animate'
        className='bg-bg/80 dark:bg-dark-bg/80 border-border dark:border-dark-border relative z-10 mx-auto w-full max-w-sm rounded-xl border p-4 shadow-2xl backdrop-blur-lg sm:max-w-md sm:rounded-2xl sm:p-6 lg:max-w-lg lg:rounded-3xl lg:p-8'
      >
        <div className='mb-4 flex items-center space-x-2 sm:mb-6 sm:space-x-3'>
          <div className='h-2 w-2 rounded-full bg-red-400 sm:h-3 sm:w-3'></div>
          <div className='h-2 w-2 rounded-full bg-yellow-400 sm:h-3 sm:w-3'></div>
          <div className='h-2 w-2 rounded-full bg-green-400 sm:h-3 sm:w-3'></div>
        </div>

        <div className='mb-4 space-y-2 sm:mb-6 sm:space-y-3 lg:space-y-4'>
          <div className='bg-primary dark:bg-dark-primary h-2 w-3/4 rounded-lg sm:h-3 lg:h-4'></div>
          <div className='bg-primary-dark dark:bg-dark-primary-dark h-2 w-1/2 rounded-lg sm:h-3 lg:h-4'></div>
          <div className='bg-primary dark:bg-dark-primary h-2 w-5/6 rounded-lg sm:h-3 lg:h-4'></div>
          <div className='bg-primary-dark dark:bg-dark-primary-dark h-2 w-2/3 rounded-lg sm:h-3 lg:h-4'></div>
        </div>
      </motion.div>

      <motion.div
        variants={circleScaleIn(0.3)}
        initial='initial'
        animate='animate'
        className='bg-primary/20 absolute -bottom-4 -left-4 h-16 w-16 rounded-full blur-xl sm:-bottom-6 sm:-left-6 sm:h-24 sm:w-24 lg:-bottom-8 lg:-left-8 lg:h-32 lg:w-32'
      />
      <motion.div
        variants={circleScaleIn(0.5)}
        initial='initial'
        animate='animate'
        className='absolute -top-6 -right-6 h-20 w-20 rounded-full bg-blue-400/10 blur-xl sm:-top-8 sm:-right-8 sm:h-32 sm:w-32 lg:-top-12 lg:-right-12 lg:h-48 lg:w-48'
      />
      <motion.div
        variants={circleScaleIn(0.7)}
        initial='initial'
        animate='animate'
        className='absolute top-1/2 -left-8 h-12 w-12 rounded-full bg-purple-400/15 blur-lg sm:-left-12 sm:h-20 sm:w-20 lg:-left-16 lg:h-24 lg:w-24'
      />
    </motion.div>
  );
};
