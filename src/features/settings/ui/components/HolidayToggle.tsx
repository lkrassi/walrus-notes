// import { cn } from 'shared/lib/cn';
// import { Button } from 'shared/ui/components/Button';
// import { useLocalization } from 'widgets/hooks';
// import { useModalActions } from 'widgets/hooks/useModalActions';
// import { HolidaySettingsModal } from './HolidaySettingsModal';

// export const HolidayToggle = () => {
//   const { t } = useLocalization();
//   const { openModalFromTrigger } = useModalActions();

//   const handleOpen = openModalFromTrigger(<HolidaySettingsModal />, {
//     title: t('settings:holiday.title') || 'Новогодние украшения',
//     size: 'md',
//     closeOnOverlayClick: true,
//     mobileContentPadding: '16px',
//   });

//   return (
//     <Button
//       variant='default'
//       className={cn('h-10', 'w-30')}
//       onClick={handleOpen}
//     >
//       {t('settings:holiday.settingsButton')}
//     </Button>
//   );
// };
