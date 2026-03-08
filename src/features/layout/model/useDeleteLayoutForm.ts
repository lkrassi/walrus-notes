import { useDeleteLayoutMutation, useTabs } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useModalContentContext } from '@/shared/lib/react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface UseDeleteLayoutFormParams {
  layoutId: string;
  onLayoutDeleted?: (layoutId: string) => void;
}

export const useDeleteLayoutForm = ({
  layoutId,
  onLayoutDeleted,
}: UseDeleteLayoutFormParams) => {
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const { closeByLayout } = useTabs();
  const [deleteLayout, { isLoading }] = useDeleteLayoutMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await deleteLayout({
        layoutId,
      }).unwrap();

      closeByLayout(layoutId);
      onLayoutDeleted?.(layoutId);
      closeModal();
    } catch {
      showError(t('layout:layoutDeletionError'));
    }
  };

  return {
    isLoading,
    closeModal,
    handleSubmit,
  };
};
