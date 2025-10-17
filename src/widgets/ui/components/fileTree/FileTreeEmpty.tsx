import { Folder, Search } from 'lucide-react';

import { useLocalization } from 'widgets/hooks';

interface FileTreeEmptyProps {
  searchQuery?: string;
}

export const FileTreeEmpty = ({ searchQuery }: FileTreeEmptyProps) => {
  const { t } = useLocalization();
  const isSearching = !!searchQuery?.trim();

  return (
    <div className='py-8 text-center'>
      {isSearching ? (
        <Search className='text-secondary dark:text-dark-secondary mx-auto mb-3 h-12 w-12' />
      ) : (
        <Folder className='text-secondary dark:text-dark-secondary mx-auto mb-3 h-12 w-12' />
      )}
      <p className='text-secondary dark:text-dark-secondary text-sm'>
        {isSearching ? t('fileTree:noSearchResults') : t('fileTree:noLayouts')}
      </p>
      <p className='text-secondary dark:text-dark-secondary mt-1 text-xs'>
        {isSearching
          ? t('fileTree:tryDifferentQuery')
          : t('fileTree:createFirstLayout')}
      </p>
    </div>
  );
};
