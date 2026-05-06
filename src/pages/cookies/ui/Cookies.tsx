import { AppRoutes } from '@/app/router/routes';
import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Cookies = () => {
  const { t } = useTranslation();

  const sections = ['cookies', 'data', 'rights'] as const;

  return (
    <div className={cn('mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-16')}>
      <motion.div
        initial='hidden'
        animate='visible'
        className={cn(
          'border-border dark:border-dark-border bg-bg/80 dark:bg-dark-bg/80',
          'rounded-3xl border p-6 backdrop-blur-xl sm:p-8 lg:p-10'
        )}
      >
        <motion.div variants={sectionVariants} className='space-y-4'>
          <p className='text-primary text-sm font-semibold tracking-[0.24em] uppercase'>
            Walrus Notes
          </p>
          <h1 className='hero-h1 text-4xl text-balance sm:text-5xl'>
            {t('cookies:title')}
          </h1>
          <p className='muted-text max-w-3xl text-lg leading-relaxed'>
            {t('cookies:intro')}
          </p>
        </motion.div>

        <div className='mt-10 grid gap-4 lg:grid-cols-3'>
          {sections.map(sectionKey => (
            <motion.section
              key={sectionKey}
              variants={sectionVariants}
              className={cn(
                'border-border dark:border-dark-border bg-bg/60 dark:bg-dark-bg/60',
                'rounded-2xl border p-5'
              )}
            >
              <h2 className='mb-3 text-xl font-bold'>
                {t(`cookies:sections.${sectionKey}.title`)}
              </h2>
              <ul className='text-muted-foreground space-y-3 text-sm leading-relaxed'>
                {(
                  t(`cookies:sections.${sectionKey}.items`, {
                    returnObjects: true,
                  }) as string[]
                ).map(item => (
                  <li key={item} className='flex gap-3'>
                    <span className='bg-primary mt-2 h-2 w-2 shrink-0 rounded-full' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        <motion.div
          variants={sectionVariants}
          className={cn(
            'border-border dark:border-dark-border mt-8 rounded-2xl border p-5',
            'bg-primary/5 dark:bg-dark-primary/10'
          )}
        >
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t('cookies:footer')}
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          className='mt-8 flex flex-wrap gap-3'
        >
          <Button to={AppRoutes.AUTH} variant='primary'>
            {t('cookies:back')}
          </Button>
          <Button to={AppRoutes.FIRST} variant='outline'>
            {t('cookies:home')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
