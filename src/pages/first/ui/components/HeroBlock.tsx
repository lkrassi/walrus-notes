import { cn } from '@/shared/lib/core';
import { Button } from '@/shared/ui';
import { ArrowRight } from 'lucide-react';

export const HeroBlock = () => {
  return (
    <section className='pt-10'>
      <div className={cn('mx-40', 'max-lg:m-10')}>
        <div className={cn('flex', 'flex-col', 'items-start')}>
          <div
            className={cn(
              'mb-6',
              'inline-flex',
              'items-center',
              'gap-2',
              'rounded-full',
              'border',
              'px-4',
              'py-1',
              'text-sm',
              'muted-text'
            )}
          >
            <span className={cn('h-2', 'w-2', 'rounded-full', 'bg-primary')} />
            Открытая бета
          </div>

          <h1 className={cn('hero-h1', 'max-w-4xl')}>
            Заметки для тех,
            <br />
            кто думает системно
          </h1>

          <p
            className={cn(
              'muted-text',
              'max-w-2xl',
              'text-lg',
              'leading-relaxed'
            )}
          >
            Создавайте связи между идеями, визуализируйте знания в графе и
            работайте вместе с командой в реальном времени.
          </p>

          <div className={cn('mt-8', 'flex', 'items-center', 'gap-6')}>
            <Button
              className={cn(
                'px-6',
                'py-3',
                'text-sm',
                'font-medium',
                'flex',
                'items-center',
                'gap-2'
              )}
            >
              Попробовать бесплатно
              <ArrowRight className={cn('h-4', 'w-4')} />
            </Button>

            <button
              className={cn(
                'text-sm',
                'font-medium',
                'muted-text',
                'transition-colors',
                'hover:text-primary'
              )}
            >
              Смотреть демо
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
