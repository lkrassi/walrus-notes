import { markdownHelpSections } from '@/features/notes/lib/markdownHelpData';
import { cn } from '@/shared/lib';
import { type FC } from 'react';
import { HelpSection } from './HelpSection';

export const MarkdownHelp: FC = () => {
  return (
    <div className={cn('p-6', 'max-w-4xl')}>
      <div className={cn('space-y-8')}>
        {markdownHelpSections.map((section, index) => (
          <HelpSection key={index} section={section} />
        ))}
      </div>
    </div>
  );
};
