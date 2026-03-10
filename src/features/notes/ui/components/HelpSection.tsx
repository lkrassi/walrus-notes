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

  return (
    <section>
      <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
        {t(section.titleKey)}
      </h3>
      {section.descriptionKey && (
        <p className={cn('mb-2')}>{t(section.descriptionKey)}</p>
      )}
      <div className={cn('bg-surface-2', 'p-4', 'rounded', 'text-sm')}>
        <pre>{t(section.exampleKey)}</pre>
      </div>
      {section.noteKey && (
        <p className={cn('mt-2', 'text-sm', 'text-muted-foreground')}>
          {t(section.noteKey)}
        </p>
      )}
    </section>
  );
});
