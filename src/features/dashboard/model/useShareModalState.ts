import { useNotifications } from '@/entities/notification';
import { useModalContentContext } from '@/shared/lib/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useShareLink } from './useShareLink';

export interface ShareModalValues {
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
  expirationOption: string;
  customMinutes: string;
}

export const shareModalValidationSchema = Yup.object().shape({
  canRead: Yup.boolean(),
  canWrite: Yup.boolean(),
  canEdit: Yup.boolean(),
  expirationOption: Yup.string().required('Выберите срок действия'),
  customMinutes: Yup.number().when('expirationOption', {
    is: 'custom',
    then: schema =>
      schema
        .required('Введите количество минут')
        .min(5, 'Минимум 5 минут')
        .max(43200, 'Максимум 30 дней (43200 минут)'),
    otherwise: schema => schema.nullable(),
  }),
});

const toExpirationIso = (values: ShareModalValues) => {
  const parsedMinutes =
    values.expirationOption === 'custom'
      ? Number(values.customMinutes)
      : Number(values.expirationOption);

  if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) {
    return null;
  }

  const now = new Date();
  const expirationDate = new Date(now.getTime() + parsedMinutes * 60000);
  return expirationDate.toISOString();
};

export const useShareModalState = (targetId: string) => {
  const { generateLink, generatedLink, resetLink } = useShareLink();
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [copied, setCopied] = useState(false);

  // Очищаем старую ссылку при смене targetId
  useEffect(() => {
    resetLink();
  }, [targetId, resetLink]);

  const initialValues: ShareModalValues = {
    canRead: true,
    canWrite: false,
    canEdit: false,
    expirationOption: '30',
    customMinutes: '',
  };

  const handleSubmit = async (values: ShareModalValues) => {
    try {
      await generateLink({
        targetId,
        canRead: values.canRead || values.canWrite || values.canEdit,
        canWrite: values.canWrite,
        canEdit: values.canEdit,
        expiredAt: toExpirationIso(values),
      }).unwrap();
    } catch {
      showError(t('share:modal.error.generic'));
    }
  };

  const handleCopy = async () => {
    if (generatedLink?.fullUrl) {
      try {
        await navigator.clipboard.writeText(generatedLink.fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const handleClose = () => {
    resetLink();
    closeModal();
  };

  const modalTitle = t('share:modal.permissions.title');

  return {
    generatedLink,
    copied,
    initialValues,
    handleSubmit,
    handleCopy,
    handleClose,
    modalTitle,
  };
};
