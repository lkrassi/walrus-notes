import { CreateLayoutForm } from '@/features/layout';
import { CreateNoteForm } from '@/features/notes';
import { useModalActions, useModalContext } from '@/shared/lib/react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateChoiceModal } from '../../ui/components/CreateChoiceModal';
import { FolderSelectModal } from '../../ui/components/FolderSelectModal';

export const useMainCreationFlows = () => {
  const { t } = useTranslation();
  const { openModal } = useModalContext();
  const { openModalFromTrigger } = useModalActions();

  const handleCreateFolder = useCallback(() => {
    openModal(<CreateLayoutForm />, {
      title: t('layout:createLayout') || 'Создать папку',
      size: 'md',
      showCloseButton: true,
    });
  }, [openModal, t]);

  const handleFolderSelected = useCallback(
    (layoutId: string) => {
      openModal(<CreateNoteForm layoutId={layoutId} />, {
        title: t('notes:createNote') || 'Создать заметку',
        size: 'md',
        showCloseButton: true,
      });
    },
    [openModal, t]
  );

  const handleStartNoteCreation = useCallback(() => {
    openModal(<FolderSelectModal onFolderSelected={handleFolderSelected} />, {
      title: '',
      size: 'md',
      showCloseButton: true,
    });
  }, [handleFolderSelected, openModal]);

  const handleOnCreateClick = openModalFromTrigger(
    <CreateChoiceModal
      onCreateFolder={handleCreateFolder}
      onCreateNote={handleStartNoteCreation}
    />,
    {
      title: t('dashboard:whatToCreate'),
      size: 'md',
      showCloseButton: true,
    }
  );

  return {
    handleOnCreateClick,
  };
};
