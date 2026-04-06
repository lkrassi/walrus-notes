import { cn } from '@/shared/lib/core';
import { PrivateHeader } from '@/widgets/ui';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import {
  useCallback,
  type FC,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { SettingsSectionActionType } from '../../model';
import { settingsSections, useSettings } from '../../model';
import { ExportDataButton } from './ExportDataButton';
import { ImageViewerModal } from './ImageViewerModal';
import { ImportDataButton } from './ImportDataButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoutActionButton } from './LogoutActionButton';
import { OpenPermissionsDashboardButton } from './OpenPermissionsDashboardButton';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Settings: FC = () => {
  const { t } = useTranslation();
  const {
    profile,
    renderAvatar,
    getSectionActionType,
    openImageViewer,
    openChangePhotoModal,
  } = useSettings();

  const renderSectionAction = useCallback(
    (actionType: SettingsSectionActionType) => {
      switch (actionType) {
        case 'theme':
          return <ThemeSwitcher />;
        case 'language':
          return <LanguageSwitcher />;
        case 'exportData':
          return <ExportDataButton />;
        case 'importData':
          return <ImportDataButton />;
        case 'permissionsDashboard':
          return <OpenPermissionsDashboardButton />;
        case 'logout':
          return <LogoutActionButton />;
        default:
          return null;
      }
    },
    []
  );

  return (
    <div className={cn('bg-bg dark:bg-dark-bg min-h-screen')}>
      <PrivateHeader />

      <main className={cn('container mx-auto px-4 py-8')}>
        <div className='mx-auto max-w-7xl'>
          <div className='grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
            <motion.aside
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className={cn('card p-6', 'max-sm:p-4')}
            >
              <div className='flex items-center gap-x-10'>
                <div className='relative'>
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center overflow-hidden rounded-full',
                      'max-sm:h-12 max-sm:w-12',
                      'focus-visible:ring-ring cursor-pointer transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none',
                      { 'cursor-default hover:opacity-100': !profile?.imgUrl }
                    )}
                    onClick={
                      profile?.imgUrl
                        ? e => {
                            openImageViewer(
                              profile?.imgUrl ? (
                                <ImageViewerModal
                                  imageUrl={`https://${profile.imgUrl}`}
                                  alt={profile.username || 'Аватар'}
                                />
                              ) : null,
                              e as unknown as ReactMouseEvent<HTMLElement>
                            );
                          }
                        : undefined
                    }
                    role={profile?.imgUrl ? 'button' : undefined}
                    tabIndex={profile?.imgUrl ? 0 : undefined}
                    onKeyDown={e => {
                      if (
                        profile?.imgUrl &&
                        (e.key === 'Enter' || e.key === ' ')
                      ) {
                        e.preventDefault();
                        openImageViewer(
                          profile?.imgUrl ? (
                            <ImageViewerModal
                              imageUrl={`https://${profile.imgUrl}`}
                              alt={profile.username || 'Аватар'}
                            />
                          ) : null,
                          e as unknown as ReactMouseEvent<HTMLElement>
                        );
                      }
                    }}
                  >
                    {renderAvatar()}
                  </div>

                  <button
                    onClick={openChangePhotoModal}
                    className={cn(
                      'absolute right-0 bottom-0',
                      'h-6 w-6 rounded-full',
                      'bg-primary text-primary-foreground',
                      'flex items-center justify-center',
                      'focus-visible:ring-ring transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none'
                    )}
                    title={t('profile:changePhoto')}
                    aria-label={t('profile:changePhoto')}
                  >
                    <Camera className='h-3.5 w-3.5' />
                  </button>
                </div>

                <div className='flex-1 lg:w-full'>
                  <h2
                    className={cn(
                      'text-text dark:text-dark-text text-xl font-bold',
                      'max-sm:text-lg'
                    )}
                  >
                    {profile?.username || t('profile:noUsername')}
                  </h2>
                  <p className={cn('muted-text text-sm', 'max-sm:text-xs')}>
                    {profile?.email || t('profile:noEmail')}
                  </p>
                </div>
              </div>
            </motion.aside>

            <div className='grid grid-cols-1 gap-4 max-sm:gap-3 md:grid-cols-2'>
              {settingsSections.map((section, idx) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: idx * 0.04 }}
                  className={cn(
                    'card flex h-full p-6 transition-shadow duration-200 hover:shadow-md',
                    'max-sm:p-4'
                  )}
                >
                  <div className='flex w-full items-center justify-between gap-x-2 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
                    <div className='flex flex-1 items-center gap-4 max-sm:w-full'>
                      <div className='flex-1 max-sm:flex-initial'>
                        <h3 className='section-title'>
                          {t(`settings:sections.${section.id}.title`)}
                        </h3>
                        <p className={cn('muted-text text-sm max-sm:text-xs')}>
                          {t(`settings:sections.${section.id}.description`)}
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'settings-action',
                        'max-sm:flex max-sm:w-full max-sm:justify-end'
                      )}
                    >
                      {renderSectionAction(
                        getSectionActionType(section.actionType)
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
