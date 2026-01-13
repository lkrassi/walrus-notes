import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import cn from 'shared/lib/cn';
import demoVideo from '../../../../assets/demo.webm';
import { useLocalization } from 'widgets/hooks/useLocalization';

const VideoDemo = () => {
  const { t } = useLocalization();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, []);

  return (
    <div
      className={cn(
        'mx-auto',
        'max-w-6xl',
        'px-4',
        'py-16',
        'sm:px-6',
        'lg:px-8'
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('text-center', 'mb-12')}
      >
        <h2 className={cn('hero-h2', 'mb-4')}>{t('main:demo.title')}</h2>
        <p className={cn('muted-text', 'text-lg', 'max-w-2xl', 'mx-auto')}>
          {t('main:demo.subtitle')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className={cn(
          'relative',
          'overflow-hidden',
          'rounded-2xl',
          'border-2',
          'border-border',
          'dark:border-dark-border',
          'shadow-2xl',
          'from-primary/5',
          'to-purple-500/5',
          'dark:from-primary/10',
          'dark:to-purple-500/10',
          'p-2'
        )}
      >
        <div
          className={cn(
            'absolute',
            'top-0',
            'left-0',
            'w-full',
            'h-full',
            'from-primary/10',
            'to-transparent',
            'pointer-events-none',
            'opacity-50'
          )}
        />

        <div
          className={cn(
            'relative',
            'overflow-hidden',
            'rounded-xl',
            'bg-black',
            'aspect-video'
          )}
        >
          <video
            ref={videoRef}
            className={cn('w-full', 'h-full', 'object-cover')}
            playsInline
            loop
            muted
            autoPlay
            preload='auto'
          >
            <source src={demoVideo} type='video/webm' />
            {t('main:demo.videoNotSupported')}
          </video>

          <div
            className={cn(
              'absolute',
              'inset-0',
              'from-black/20',
              'via-transparent',
              'to-transparent',
              'pointer-events-none'
            )}
          />
        </div>

        <div
          className={cn(
            'absolute',
            'top-4',
            'left-4',
            'w-8',
            'h-8',
            'border-t-2',
            'border-l-2',
            'border-primary',
            'rounded-tl-lg',
            'opacity-50'
          )}
        />
        <div
          className={cn(
            'absolute',
            'top-4',
            'right-4',
            'w-8',
            'h-8',
            'border-t-2',
            'border-r-2',
            'border-primary',
            'rounded-tr-lg',
            'opacity-50'
          )}
        />
        <div
          className={cn(
            'absolute',
            'bottom-4',
            'left-4',
            'w-8',
            'h-8',
            'border-b-2',
            'border-l-2',
            'border-primary',
            'rounded-bl-lg',
            'opacity-50'
          )}
        />
        <div
          className={cn(
            'absolute',
            'bottom-4',
            'right-4',
            'w-8',
            'h-8',
            'border-b-2',
            'border-r-2',
            'border-primary',
            'rounded-br-lg',
            'opacity-50'
          )}
        />
      </motion.div>
    </div>
  );
};

export default VideoDemo;
