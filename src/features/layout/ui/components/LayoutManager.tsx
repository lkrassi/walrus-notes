import { useModalContext, useLocalization } from 'widgets';
import { CreateLayout } from './CreateLayout';
import { LayoutList } from './LayoutList';

export const LayoutManager = () => {
  const { t } = useLocalization();
  const { openModal } = useModalContext();

  const handleViewAllLayouts = () => {
    openModal(
      <LayoutList />,
      {
        title: t('layout:allMyLayouts'),
        size: 'xl',
        closeOnOverlayClick: false,
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text dark:text-dark-text">
          {t('layout:layoutManagement')}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
            {t('layout:createNewLayout')}
          </h2>
          <CreateLayout />
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
            {t('layout:myLayouts')}
          </h2>
          <p className="text-secondary dark:text-dark-secondary mb-4">
            {t('layout:viewAndManageLayouts')}
          </p>
          <button
            onClick={handleViewAllLayouts}
            className="
              w-full px-6 py-3 rounded-lg
              bg-primary dark:bg-dark-primary
              hover:bg-primary-dark dark:hover:bg-dark-primary-dark
              text-white font-semibold
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary
            "
          >
            {t('layout:showAllLayouts')}
          </button>
        </div>
      </div>
    </div>
  );
};
