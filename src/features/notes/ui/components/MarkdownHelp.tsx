import { cn } from '@/shared/lib/core';
import { type FC } from 'react';
import { markdownHelpSections } from '../../lib/markdownHelpData';
import { HelpSection } from './HelpSection';

export const MarkdownHelp: FC = () => {
  return (
    <div className={cn('max-w-4xl')}>
      <div className={cn('space-y-8')}>
        {markdownHelpSections.map((section, index) => (
          <HelpSection key={index} section={section} />
        ))}
      </div>
    </div>
  );
};
