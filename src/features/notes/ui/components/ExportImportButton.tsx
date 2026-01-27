import { Download, Upload } from 'lucide-react';
import { Button } from 'shared';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';
import { MdImportModal } from './MdImportModal';

interface Props {
  onExport: () => void;
  onImport: (content: string) => void;
  disabled?: boolean;
}

export const ExportImportButton: React.FC<Props> = ({
  onExport,
  onImport,
  disabled,
}) => {
  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();

  const ModalContent: React.FC<{
    onExport: () => void;
    onImport: (c: string) => void;
  }> = ({ onExport: doExport, onImport: doImport }) => {
    const { closeModal } = useModalContentContext();
    return (
      <div className={cn('p-4', 'space-y-4')}>
        <div className={cn('flex', 'gap-2', 'justify-center')}>
          <Button
            onClick={() => {
              doExport();
              closeModal();
            }}
            className={cn('px-4', 'py-2')}
            variant='default'
          >
            {t('notes:export')}
          </Button>
          <Button
            onClick={e => {
              const openImport = openModalFromTrigger(
                <MdImportModal onImported={doImport} />,
                { title: t('notes:import') }
              );
              openImport(e as React.MouseEvent<HTMLElement>);
            }}
            className={cn('px-4', 'py-2')}
            variant='default'
          >
            {t('notes:import')}
          </Button>
        </div>
      </div>
    );
  };

  const open = openModalFromTrigger(
    <ModalContent onExport={onExport} onImport={onImport} />,
    { title: t('notes:exportImportTitle') }
  );

  return (
    <Button
      onClick={open}
      className={cn('px-4', 'py-2')}
      title={t('notes:exportImport')}
      variant='default'
      disabled={disabled}
    >
      <div className={cn('flex', 'items-center', 'gap-1')}>
        <Download className={cn('h-4', 'w-4')} />
        <Upload className={cn('h-4', 'w-4')} />
      </div>
    </Button>
  );
};
