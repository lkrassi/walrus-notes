import { cn } from '@/shared/lib/core';
import { type FC } from 'react';
import { markdownHelpSections } from '../../lib/markdownHelpData';
import { HelpSection } from './HelpSection';

export const MarkdownHelp: FC = () => {
  return (
    <div className={cn('max-w-4xl')}>
      <div className={cn('grid', 'gap-4', 'sm:grid-cols-2')}>
        {markdownHelpSections.map(section => (
          <HelpSection key={section.titleKey} section={section} />
        ))}
      </div>
    </div>
  );
};
