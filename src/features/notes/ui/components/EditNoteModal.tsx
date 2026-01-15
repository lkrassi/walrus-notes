import React, { useState, useRef, useEffect } from 'react';
import cn from 'shared/lib/cn';
import { Button, Input } from 'shared';
import { useLocalization } from 'widgets';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

interface Props {
  title?: string;
  onSaved: (title: string) => Promise<void> | void;
}

const EditNoteModal: React.FC<Props> = ({ title = '', onSaved }) => {
  const { closeModal } = useModalContentContext();
  const { t } = useLocalization();
  const [value, setValue] = useState(title);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await onSaved(value);
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', 'p-6')}>
      <div>
        <label className={cn('tw-label')}>
          {t('notes:editTitleLabel') || 'Edit title'}
        </label>
        <Input
          ref={inputRef}
          type='text'
          value={value}
          onChange={e => setValue(e.target.value)}
          className={cn('form-input', 'rounded-md')}
          disabled={isLoading}
        />
      </div>

      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button
          type='button'
          onClick={() => closeModal()}
          variant='escape'
          className={cn('btn')}
          disabled={isLoading}
        >
          {t('notes:cancel')}
        </Button>
        <Button
          type='submit'
          variant={!value.trim() || isLoading ? 'disabled' : 'submit'}
          className={cn('btn')}
          disabled={!value.trim() || isLoading}
        >
          {isLoading ? t('notes:saving') : t('notes:save')}
        </Button>
      </div>
    </form>
  );
};

export default EditNoteModal;
