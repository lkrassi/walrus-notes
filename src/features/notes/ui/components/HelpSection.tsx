import { cn } from '@/shared/lib/core';
import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { HelpSectionData } from '../../lib/markdownHelpData';

interface HelpSectionProps {
  section: HelpSectionData;
}

export const HelpSection: FC<HelpSectionProps> = memo(function HelpSection({
  section,
}) {
  const { t } = useTranslation();
  const example = t(section.exampleKey);

  return (
    <section
      className={cn(
        'overflow-hidden',
        'rounded-2xl',
        'border',
        'border-border',
        'bg-bg',
        'shadow-sm'
      )}
    >
      <div className={cn('border-b', 'border-border/70', 'px-4', 'py-3')}>
        <div className={cn('flex', 'items-center', 'justify-between', 'gap-3')}>
          <h3 className={cn('text-base', 'font-semibold', 'text-text')}>
            {t(section.titleKey)}
          </h3>
          <span
            className={cn(
              'rounded-full',
              'bg-primary/10',
              'px-2.5',
              'py-1',
              'text-[11px]',
              'font-medium',
              'uppercase',
              'tracking-wide',
              'text-primary'
            )}
          >
            Markdown
          </span>
        </div>

        {section.descriptionKey && (
          <p
            className={cn(
              'mt-2',
              'text-sm',
              'leading-6',
              'text-muted-foreground'
            )}
          >
            {t(section.descriptionKey)}
          </p>
        )}
      </div>

      <div className={cn('grid', 'gap-3', 'px-4', 'py-4')}>
        <div className={cn('space-y-2')}>
          <div
            className={cn(
              'inline-flex',
              'items-center',
              'rounded-full',
              'bg-secondary/20',
              'px-2.5',
              'py-1',
              'text-[11px]',
              'font-medium',
              'uppercase',
              'tracking-wide',
              'text-secondary-foreground'
            )}
          >
            Пример
          </div>
          <pre
            className={cn(
              'overflow-x-auto',
              'rounded-xl',
              'border',
              'border-border/70',
              'bg-surface-2',
              'px-4',
              'py-3',
              'text-sm',
              'leading-6',
              'text-text'
            )}
          >
            {example}
          </pre>
        </div>

        {section.noteKey && (
          <div
            className={cn(
              'rounded-xl',
              'border',
              'border-dashed',
              'border-border/80',
              'bg-muted/35',
              'px-4',
              'py-3'
            )}
          >
            <p className={cn('text-sm', 'leading-6', 'text-muted-foreground')}>
              {t(section.noteKey)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
});
