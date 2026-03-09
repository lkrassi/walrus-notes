import { CreateLayoutForm } from '@/features/layout';
import { CreateNoteForm } from '@/features/notes';
import {
  MODAL_SIZE_PRESETS,
  useModalActions,
  useModalContext,
} from '@/shared/lib/react';
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
      size: MODAL_SIZE_PRESETS.layoutCreate,
      showCloseButton: true,
    });
  }, [openModal, t]);

  const handleFolderSelected = useCallback(
    (layoutId: string) => {
      openModal(<CreateNoteForm layoutId={layoutId} />, {
        title: t('notes:createNote') || 'Создать заметку',
        size: MODAL_SIZE_PRESETS.noteCreate,
        showCloseButton: true,
      });
    },
    [openModal, t]
  );

  const handleStartNoteCreation = useCallback(() => {
    openModal(<FolderSelectModal onFolderSelected={handleFolderSelected} />, {
      title: '',
      size: MODAL_SIZE_PRESETS.folderSelect,
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
      size: MODAL_SIZE_PRESETS.createChoice,
      showCloseButton: true,
    }
  );

  return {
    handleOnCreateClick,
  };
};
