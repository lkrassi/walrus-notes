import { motion } from 'framer-motion';
import React from 'react';
import { Button } from 'shared';
import { ThemeSwitcher } from 'widgets';
import {
  fadeInUp,
  floatAnimation,
  scaleIn,
  slideInFromLeft,
  slideInFromRight,
  staggerContainer,
} from '../models/animation-variants';

export const Main: React.FC = () => {
  const handleGetStarted = () => {
    window.location.href = '/auth';
  };

  return (
    <div className='min-h-screen bg-gradient overflow-x-hidden'>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='px-4 sm:px-6 py-4 sm:py-6 flex justify-between'
      >
        <div>
          <motion.div
            className='flex items-center space-x-3 sm:space-x-4'
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <motion.div
              className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-primary-gradient rounded-2xl flex items-center justify-center shadow-lg'
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <span>🐋</span>
            </motion.div>
            <span className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-gradient bg-clip-text text-transparent'>
              Walrus Notes
            </span>
          </motion.div>
        </div>
        <ThemeSwitcher />
      </motion.header>

      <main className='px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20'>
        <motion.div
          variants={staggerContainer}
          initial='initial'
          animate='animate'
          className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center'
        >
          <motion.div
            variants={slideInFromLeft}
            className='space-y-6 sm:space-y-8 lg:space-y-10'
          >
            <motion.div variants={fadeInUp} className='space-y-4 sm:space-y-6'>
              <motion.h1
                variants={fadeInUp}
                className='text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-text dark:text-dark-text leading-tight'
              >
                Погрузитесь в
                <motion.span
                  className='block bg-gradient-to-r from-primary to-primary-gradient bg-clip-text text-transparent'
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  мир идей
                </motion.span>
              </motion.h1>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className='text-lg sm:text-xl lg:text-2xl text-secondary dark:text-dark-secondary leading-relaxed'
            >
              Глубокий океан ваших мыслей ждет исследования. Создавайте,
              связывайте и открывайте идеи с мощью морского интеллекта! 🦭
            </motion.p>

            <motion.div variants={fadeInUp} className='space-y-3 sm:space-y-4'>
              {[
                'Интуитивное связывание заметок как морские течения',
                'Глубокий поиск в океане ваших знаний',
                'Плывите по волнам продуктивности с легкостью',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className='flex items-center space-x-3 sm:space-x-4 p-3 '
                  whileHover={{ x: 10 }}
                >
                  <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-gradient rounded-full flex items-center justify-center shadow-md flex-shrink-0'>
                    <span className='text-white text-xs sm:text-sm'>✓</span>
                  </div>
                  <span className='text-text dark:text-dark-text text-base sm:text-lg'>
                    {feature}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className='flex flex-col sm:flex-row gap-3 sm:gap-4'
            >
              <motion.div variants={scaleIn}>
                <Button onClick={handleGetStarted} className='p-3'>
                  Начать путешествие
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={slideInFromRight}
            className='relative mt-8 lg:mt-0'
          >
            <motion.div
              variants={floatAnimation}
              initial='initial'
              animate='animate'
              className='relative z-10 bg-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border border-border dark:border-dark-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl mx-auto max-w-md lg:max-w-none'
            >
              <div className='flex items-center space-x-3 mb-4 sm:mb-6'>
                <div className='w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full'></div>
                <div className='w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full'></div>
                <div className='w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full'></div>
              </div>

              <div className='space-y-3 sm:space-y-4 mb-4 sm:mb-6'>
                <div className='h-3 sm:h-4 bg-primary dark:bg-dark-primary rounded-lg w-3/4'></div>
                <div className='h-3 sm:h-4 bg-primary-dark dark:bg-dark-primary-dark rounded-lg w-1/2'></div>
                <div className='h-3 sm:h-4 bg-primary dark:bg-dark-primary rounded-lg w-5/6'></div>
                <div className='h-3 sm:h-4 bg-primary-dark dark:bg-dark-primary-dark rounded-lg w-2/3'></div>
              </div>

              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                className='absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary-gradient rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg'
              >
                🐋
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className='absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-24 h-24 sm:w-40 sm:h-40 bg-primary/20 rounded-full blur-xl'
            ></motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className='absolute -top-10 -right-10 sm:-top-16 sm:-right-16 w-32 h-32 sm:w-60 sm:h-60 bg-blue-400/10 rounded-full blur-xl'
            ></motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className='absolute top-1/2 -left-12 sm:-left-20 w-20 h-20 sm:w-32 sm:h-32 bg-purple-400/15 rounded-full blur-lg'
            ></motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};
