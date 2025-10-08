import React from 'react';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';

import {
  fadeInUp,
  featureItemHover,
  scaleIn,
  slideInFromLeft,
  staggerContainer,
} from 'features/main/models';
import { useLocalization } from 'widgets/hooks/useLocalization';

export const HeroLeft: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  const handleGetStarted = () => navigate('/auth');

  const features = [
    t('main:features.intuitiveLinking'),
    t('main:features.deepSearch'),
    t('main:features.productivity'),
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='order-2 w-full lg:order-1'
    >
      <motion.div variants={slideInFromLeft}>
        <motion.div variants={fadeInUp} className='space-y-4 lg:space-y-6'>
          <motion.h1
            variants={fadeInUp}
            className='xs:text-4xl text-text dark:text-dark-text mb-6 text-center text-3xl font-bold sm:mb-8 sm:text-5xl lg:mb-10 lg:text-left lg:text-6xl xl:text-7xl'
          >
            {t('main:hero.titleLine1')}
            <motion.span
              className='from-primary to-primary-gradient mt-2 block bg-gradient-to-r bg-clip-text text-transparent lg:mt-3'
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {t('main:hero.titleLine2')}
            </motion.span>
          </motion.h1>
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className='xs:text-base text-secondary dark:text-dark-secondary xs:px-0 mb-6 px-2 text-center text-sm leading-relaxed sm:mb-8 sm:text-lg lg:mb-10 lg:text-left lg:text-xl xl:text-2xl'
        >
          {t('main:hero.description')}
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className='xs:space-y-3 mb-6 space-y-2 sm:mb-8 lg:space-y-4'
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={featureItemHover}
              whileHover='hover'
              className='xs:space-x-3 xs:p-3 flex items-center space-x-2 p-2 lg:space-x-4 lg:p-4'
            >
              <div className='xs:w-5 xs:h-5 from-primary to-primary-gradient flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-md sm:h-6 sm:w-6 lg:h-7 lg:w-7'>
                <span className='xs:text-sm text-xs text-white'>✓</span>
              </div>
              <span className='xs:text-sm text-text dark:text-dark-text flex-1 text-xs sm:text-base lg:text-lg'>
                {feature}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className='xs:flex-row flex flex-col justify-center gap-3 pt-4 sm:gap-4 lg:justify-start'
        >
          <motion.div variants={scaleIn} className='xs:w-auto w-full'>
            <Button
              onClick={handleGetStarted}
              className='bg-btn-bg hover:bg-btn-hover xs:px-6 xs:text-base px-4 py-3 text-sm sm:text-lg'
            >
              {t('main:hero.getStarted')}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
