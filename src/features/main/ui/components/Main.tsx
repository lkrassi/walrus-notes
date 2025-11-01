import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/components/Button';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { PublicHeader } from 'widgets/ui';
import {
  containerVariants,
  featureVariants,
  features,
  itemVariants,
} from '../../models';

export const Main = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  // Правильная локализация features
  const featureKeys = [
    'visualThinking',
    'fastOrganization',
    'smartConnections',
    'secureStorage',
    'collaboration',
  ];

  const localizedFeatures = features.map((feature, index) => ({
    ...feature,
    title: t(`main:features.${featureKeys[index]}`),
    description: t(`main:features.${featureKeys[index]}Desc`),
  }));

  return (
    <>
      <PublicHeader />
      <div className='flex min-h-[80vh] items-center justify-center px-4 sm:px-6 lg:px-8'>
        <motion.div
          className='mx-40'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <div className='flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:gap-16'>
            <div className='flex-1 text-left'>
              <motion.h1
                variants={itemVariants}
                className='text-text dark:text-dark-text mb-6 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl'
              >
                {t('main:title.line1')}
                <br />
                <span className='text-primary'>{t('main:title.line2')}</span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className='text-secondary dark:text-dark-secondary mb-8 text-xl leading-relaxed'
              >
                {t('main:subtitle')}
              </motion.p>
              <motion.div
                variants={itemVariants}
                className='flex flex-col gap-4 sm:flex-row sm:items-center'
              >
                <Button
                  onClick={() => {
                    navigate('/auth');
                  }}
                  className='px-8 py-4 text-lg font-semibold'
                >
                  {t('main:cta.primary')}
                </Button>
              </motion.div>
            </div>
            <div className='flex-1'>
              <motion.div
                variants={containerVariants}
                className='grid grid-cols-1 gap-4 sm:grid-cols-2'
              >
                {localizedFeatures.map((feature, index) => (
                  <motion.div
                    key={featureKeys[index]}
                    variants={featureVariants}
                    className='group border-border dark:border-dark-border dark:bg-dark-bg/50 dark:hover:border-dark-primary/30 hover:border-primary/30 rounded-xl border bg-white/50 p-4 transition-all duration-300 hover:shadow-lg'
                  >
                    <div className='bg-primary/10 text-primary dark:bg-dark-primary/10 dark:text-dark-primary mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110'>
                      <feature.icon className='h-5 w-5' />
                    </div>
                    <h3 className='text-text dark:text-dark-text mb-2 text-base font-semibold'>
                      {feature.title}
                    </h3>
                    <p className='text-secondary dark:text-dark-secondary text-xs leading-relaxed'>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          <motion.div
            className='bg-primary/5 dark:bg-dark-primary/5 absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full blur-3xl'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />

          <motion.div
            className='bg-primary/3 dark:bg-dark-primary/3 absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 rounded-full blur-3xl'
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut' as const,
              delay: 1,
            }}
          />
        </motion.div>
      </div>
    </>
  );
};
