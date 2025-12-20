import { Folder } from 'lucide-react';
import cn from 'shared/lib/cn';

import { useLocalization } from 'widgets/hooks';

export const FileTreeEmpty = () => {
  const { t } = useLocalization();

  return (
    <div className={cn('py-8', 'text-center')}>
      <Folder
        className={cn(
          'text-secondary',
          'dark:text-dark-secondary',
          'mx-auto',
          'mb-3',
          'h-12',
          'w-12'
        )}
      />
      <p
        className={cn('text-secondary', 'dark:text-dark-secondary', 'text-sm')}
      >
        {t('fileTree:noLayouts')}
      </p>
      <p
        className={cn(
          'text-secondary',
          'dark:text-dark-secondary',
          'mt-1',
          'text-xs'
        )}
      >
        {t('fileTree:createFirstLayout')}
      </p>
    </div>
  );
};
