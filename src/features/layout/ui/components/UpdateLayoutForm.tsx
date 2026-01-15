import React, { useState, useRef, useEffect } from 'react';
import { useUpdateLayoutMutation } from 'app/store/api';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';
import ColorSelector from './ColorSelector';
import { Input } from 'shared';

interface UpdateLayoutFormProps {
  layoutId: string;
  layoutTitle?: string;
  layoutColor?: string;
  onLayoutUpdated?: (
    layoutId: string,
    data?: { title?: string; color?: string }
  ) => void;
}

export const UpdateLayoutForm: React.FC<UpdateLayoutFormProps> = ({
  layoutId,
  layoutTitle = '',
  layoutColor = undefined,
  onLayoutUpdated,
}) => {
  const { t } = useLocalization();
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [updateLayout, { isLoading }] = useUpdateLayoutMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(layoutTitle);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const normalizeHex = (c?: string) => {
    if (!c) return undefined;
    const s = c.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return s.toLowerCase();
    if (/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s))
      return `#${s.toLowerCase()}`;
    return undefined;
  };

  const [color, setColor] = useState<string | undefined>(
    normalizeHex(layoutColor)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLayout({
        layoutId,
        title: title || undefined,
        color,
      }).unwrap();
      if (onLayoutUpdated)
        onLayoutUpdated(layoutId, { title: title || undefined, color });
      closeModal();
    } catch (_e) {
      showError(t('layout:updateError') || 'Failed to update layout');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', 'p-6')}>
      <div>
        <label htmlFor='layout-title' className={cn('tw-label')}>
          {t('layout:layoutTitle')}
        </label>
        <Input
          ref={inputRef}
          id='layout-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('layout:layoutTitlePlaceholder')}
          className={cn('form-input', 'rounded-md')}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className={cn('tw-label')}>{t('layout:chooseColor')}</label>
        <div className={cn('mt-2', 'text-center')}>
          <ColorSelector value={color} onChange={setColor} />
        </div>
      </div>

      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button
          type='button'
          onClick={closeModal}
          variant='escape'
          className={cn('btn')}
          disabled={isLoading}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant={!title.trim() || isLoading ? 'disabled' : 'submit'}
          className={cn('btn')}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? t('layout:updating') : t('layout:updateLayout')}
        </Button>
      </div>
    </form>
  );
};

export default UpdateLayoutForm;
