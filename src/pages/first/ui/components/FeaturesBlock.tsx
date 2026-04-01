import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  containerVariants,
  containerVariantsMobile,
  featureVariants,
  featureVariantsMobile,
  features,
} from '../../model';

export const FeaturesBlock = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const featureKeys = [
    'visualThinking',
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
      <div className={cn('mx-40', 'max-lg:m-10')}>
        <section className='mt-10'>
          <h2>Всё необходимое для работы с заметками</h2>

          <p className='mt-4 mb-10'>
            Инструменты для эффективной организации знаний
          </p>
        </section>

        <div className={cn('flex', 'justify-center', 'items-center')}>
          <motion.div
            variants={isMobile ? containerVariantsMobile : containerVariants}
            className={cn(
              'grid',
              'grid-cols-1',
              'gap-x-24',
              'gap-y-4',
              'sm:grid-cols-2'
            )}
          >
            {localizedFeatures.map((feature, index) => (
              <motion.div
                key={featureKeys[index]}
                variants={isMobile ? featureVariantsMobile : featureVariants}
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
                <p className={cn('muted-text', 'text-xs', 'leading-relaxed')}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};
