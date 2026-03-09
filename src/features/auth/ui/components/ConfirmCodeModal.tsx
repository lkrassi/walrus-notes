import { useConfirmCodeMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { Button, Input } from '@/shared';
import { cn } from '@/shared/lib/core';
import {
  type ClipboardEvent,
  type FC,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmCodeModalProps {
  email: string;
  onSuccess: () => void;
}

export const ConfirmCodeModal: FC<ConfirmCodeModalProps> = ({
  email,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const [confirmCode] = useConfirmCodeMutation();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedCode = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    const newCode = [...code];
    pastedCode.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex(c => !c);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      return;
    }

    setIsLoading(true);

    try {
      await confirmCode({
        email,
        code: codeString,
      }).unwrap();

      onSuccess();
    } catch (_e) {
      showError(t('auth:confirmCode.error.invalid') || 'Неверный код');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className='flex w-full flex-col gap-3 p-6'>
      <div className='text-center'>
        <p className='text-secondary dark:text-dark-secondary text-sm'>
          {t('auth:confirmCode.description') ||
            'Код подтверждения отправлен на'}
          <br />
          <span className='text-text dark:text-dark-text font-semibold'>
            {email}
          </span>
        </p>
      </div>

      <div className='mx-auto flex w-full max-w-[320px] justify-center gap-1'>
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={digit}
            autoFocus={index === 0}
            onChange={e =>
              handleInputChange(index, (e.target as HTMLInputElement).value)
            }
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={cn(
              'h-12 w-12 px-0 text-center text-lg font-semibold',
              digit ? 'border-primary dark:border-dark-primary' : ''
            )}
          />
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || code.join('').length !== 6}
        variant={
          isLoading || code.join('').length !== 6 ? 'disabled' : 'default'
        }
        className='btn w-full'
      >
        {isLoading
          ? t('auth:confirmCode.loading')
          : t('auth:confirmCode.submit')}
      </Button>
    </div>
  );
};
