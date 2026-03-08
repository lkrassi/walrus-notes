import { logoImage as logo } from '@/shared/assets';
import { cn } from '@/shared/lib/core';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import {
  useCallback,
  type FC,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SettingsSectionActionType } from '../../model';
import { settingsSections, useSettings } from '../../model';
import { ExportDataButton } from './ExportDataButton';
import { ImageViewerModal } from './ImageViewerModal';
import { ImportDataButton } from './ImportDataButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoutActionButton } from './LogoutActionButton';
import { OpenPermissionsDashboardButton } from './OpenPermissionsDashboardButton';
import { ThemeSwitcher } from './ThemeSwitcher';

const SettingsHeader = () => {
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        'dark:bg-dark-bg',
        'border-border',
        'dark:border-dark-border',
        'flex',
        'flex-col',
        'gap-3',
        'border-b',
        'max-md:py-5',
        'md:px-5'
      )}
    >
      <div
        className={cn(
          'flex',
          'items-center',
          'justify-between',
          'px-4',
          'md:px-0'
        )}
      >
        <div className={cn('flex', 'items-center')}>
          <Link
            to='/main'
            className={cn('flex', 'items-center')}
            aria-label={t('common:header.goToHomepage')}
          >
            <img
              src={logo}
              alt={t('common:header.logoAlt')}
              className={cn('h-16', 'w-16', 'md:h-22', 'md:w-22')}
              loading='lazy'
            />
            <div className={cn('flex', 'items-baseline', 'gap-1')}>
              <h1 className={cn('text-text', 'dark:text-dark-text')}>Walrus</h1>
              <h1 className={cn('text-primary')}>Notes</h1>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export const Settings: FC = () => {
  const { t } = useTranslation();
  const {
    profile,
    renderAvatar,
    renderSectionIcon,
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
      <SettingsHeader />

      <main className={cn('container mx-auto px-4 py-8')}>
        <div className='mx-auto max-w-7xl'>
          <div className='grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
            <motion.aside
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className={cn('card p-6', 'max-sm:rounded-lg max-sm:p-4')}
            >
              <div className='flex items-center gap-x-10'>
                <div className='relative'>
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center overflow-hidden rounded-full',
                      'max-sm:h-12 max-sm:w-12',
                      'cursor-pointer transition-opacity hover:opacity-80',
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
                      'bg-primary dark:bg-dark-primary',
                      'flex items-center justify-center text-white',
                      'transition-opacity hover:opacity-90'
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
                  <p
                    className={cn(
                      'text-secondary dark:text-dark-secondary text-sm',
                      'max-sm:text-xs'
                    )}
                  >
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
                    'max-sm:rounded-lg max-sm:p-4'
                  )}
                >
                  <div className='flex w-full items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3'>
                    <div className='flex flex-1 items-center gap-4 max-sm:w-full'>
                      <div
                        className={cn(
                          'rounded-lg p-2 max-sm:rounded-md max-sm:p-1.5',
                          'bg-primary/10 dark:bg-dark-primary/10',
                          'text-primary dark:text-dark-primary'
                        )}
                      >
                        {renderSectionIcon(section.icon)}
                      </div>

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
