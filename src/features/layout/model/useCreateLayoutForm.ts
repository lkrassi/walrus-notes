import { useCreateLayoutMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useModalContentContext } from '@/shared/lib/react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface UseCreateLayoutFormParams {
  onLayoutCreated?: () => void;
}

const DEFAULT_COLOR = '#3b82f6';

export const useCreateLayoutForm = ({
  onLayoutCreated,
}: UseCreateLayoutFormParams) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<string | undefined>(DEFAULT_COLOR);
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [createLayout, { isLoading }] = useCreateLayoutMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      showError(t('layout:enterLayoutTitle'));
      return;
    }

    try {
      await createLayout({
        title: title.trim(),
        color: color || DEFAULT_COLOR,
      }).unwrap();

      setTitle('');
      onLayoutCreated?.();
      closeModal();
    } catch {
      showError(t('layout:layoutCreationError'));
    }
  };

  return {
    title,
    color,
    isLoading,
    closeModal,
    setTitle,
    setColor,
    handleSubmit,
    isSubmitDisabled: isLoading || !title.trim() || !color,
  };
};
