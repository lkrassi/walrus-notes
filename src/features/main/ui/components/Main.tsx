import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import cn from 'shared/lib/cn';
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
      <div
        className={cn('flex', 'min-h-[80vh]', 'items-center', 'justify-center')}
      >
        <motion.div
          className={cn('mx-40', 'max-lg:m-10')}
          variants={containerVariants}
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
              <motion.h1 variants={itemVariants} className={cn('hero-h1')}>
                {t('main:title.line1')}
                <br />
                <span className={cn('text-primary')}>
                  {t('main:title.line2')}
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className={cn(
                  'muted-text',
                  'mb-8',
                  'text-xl',
                  'leading-relaxed',
                  'max-lg:w-full',
                  'max-lg:text-center'
                )}
              >
                {t('main:subtitle')}
              </motion.p>
              <motion.div
                variants={itemVariants}
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
                  {t('main:cta.primary')}
                </Button>
              </motion.div>
            </div>
            <div className={cn('flex-1')}>
              <motion.div
                variants={containerVariants}
                className={cn('grid', 'grid-cols-1', 'gap-4', 'sm:grid-cols-2')}
              >
                {localizedFeatures.map((feature, index) => (
                  <motion.div
                    key={featureKeys[index]}
                    variants={featureVariants}
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
