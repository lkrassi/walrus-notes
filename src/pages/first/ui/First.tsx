import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { Button } from '@/shared/ui';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  containerVariants,
  containerVariantsMobile,
  featureVariants,
  featureVariantsMobile,
  features,
  itemVariants,
  itemVariantsMobile,
} from '../model';

export const First = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const featureKeys = [
    'fastOrganization',
    'smartConnections',
    'secureStorage',
    'collaboration',
  ];

  const localizedFeatures = features.map((feature, index) => ({
    ...feature,
    title: t(`first:features.${featureKeys[index]}`),
    description: t(`first:features.${featureKeys[index]}Desc`),
  }));

  return (
    <>
      <div
        className={cn('flex', 'min-h-[80vh]', 'items-center', 'justify-center')}
      >
        <motion.div
          className={cn('mx-40', 'max-lg:m-10')}
          variants={isMobile ? containerVariantsMobile : containerVariants}
          initial='hidden'
          animate='visible'
        >
          <div
            className={cn(
              'flex',
              'flex-col',
              'items-start',
              'gap-12',
              'lg:flex-row',
              'lg:items-center',
              'lg:gap-16'
            )}
          >
            <div className={cn('flex-1', 'text-left')}>
              <motion.h1
                variants={isMobile ? itemVariantsMobile : itemVariants}
                className={cn('hero-h1')}
              >
                {t('first:title.line1')}
                <br />
                <span className={cn('text-primary')}>
                  {t('first:title.line2')}
                </span>
              </motion.h1>
              <motion.p
                variants={isMobile ? itemVariantsMobile : itemVariants}
                className={cn(
                  'muted-text',
                  'mb-8',
                  'text-xl',
                  'leading-relaxed',
                  'max-lg:w-full',
                  'max-lg:text-center'
                )}
              >
                {t('first:subtitle')}
              </motion.p>
              <motion.div
                variants={isMobile ? itemVariantsMobile : itemVariants}
                className={cn(
                  'flex',
                  'flex-col',
                  'gap-4',
                  'sm:flex-row',
                  'sm:items-center'
                )}
              >
                <Button
                  onClick={() => {
                    navigate('/auth');
                  }}
                  className={cn('px-8', 'py-4', 'text-lg', 'font-semibold')}
                >
                  {t('first:cta.primary')}
                </Button>
              </motion.div>
            </div>

            <div className={cn('flex-1')}>
              <motion.div
                variants={
                  isMobile ? containerVariantsMobile : containerVariants
                }
                className={cn('grid', 'grid-cols-1', 'gap-4', 'sm:grid-cols-2')}
              >
                {localizedFeatures.map((feature, index) => (
                  <motion.div
                    key={featureKeys[index]}
                    variants={
                      isMobile ? featureVariantsMobile : featureVariants
                    }
                    className={cn('feature-card')}
                  >
                    <div
                      className={cn(
                        'bg-primary/10',
                        'text-primary',
                        'dark:bg-dark-primary/10',
                        'dark:text-dark-primary',
                        'mb-3',
                        'inline-flex',
                        'h-10',
                        'w-10',
                        'items-center',
                        'justify-center',
                        'rounded-lg'
                      )}
                    >
                      <feature.icon className={cn('h-5', 'w-5')} />
                    </div>
                    <h3 className={cn('feature-title')}>{feature.title}</h3>
                    <p
                      className={cn('muted-text', 'text-xs', 'leading-relaxed')}
                    >
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
