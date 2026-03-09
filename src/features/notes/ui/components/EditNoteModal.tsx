import { Button, Input } from '@/shared';
import { cn } from '@/shared/lib/core';
import { useModalContentContext } from '@/shared/lib/react';
import {
  useEffect,
  useRef,
  useState,
  type FC,
  type SyntheticEvent,
} from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title?: string;
  onSaved: (title: string) => Promise<void> | void;
}

export const EditNoteModal: FC<Props> = ({ title = '', onSaved }) => {
  const { closeModal } = useModalContentContext();
  const { t } = useTranslation();
  const [value, setValue] = useState(title);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
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
    <form onSubmit={handleSubmit} className={cn('space-y-6', 'p-6')}>
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
