import { useLocalization } from 'widgets/hooks';

export const FileTreeLoading = () => {
  const { t } = useLocalization();
  return (
    <div className='flex items-center justify-center p-8'>
      <div className='border-primary h-6 w-6 animate-spin rounded-full border-b-2'></div>
      <span className='text-secondary dark:text-dark-secondary ml-3 text-sm'>
        {t('fileTree:loading')}
      </span>
    </div>
  );
};
