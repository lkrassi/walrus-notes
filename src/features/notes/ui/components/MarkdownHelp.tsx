import { type FC } from 'react';
import { cn } from 'shared/lib/cn';
import { markdownHelpSections } from '../../lib/markdownHelpData';
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
