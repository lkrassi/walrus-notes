import { useConfirmCodeMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { Button, Input } from '@/shared';
import { cn } from '@/shared/lib/core';
import {
  type ChangeEvent,
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

  const applyDigitsFrom = (startIndex: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 6 - startIndex);
    if (!digits.length) return;

    const next = [...code];
    for (let offset = 0; offset < digits.length; offset += 1) {
      next[startIndex + offset] = digits[offset];
    }
    setCode(next);

    const nextIndex = Math.min(startIndex + digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleInputChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (value.length > 1) {
      applyDigitsFrom(index, value);
      return;
    }

    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newCode = [...code];

      if (newCode[index]) {
        newCode[index] = '';
        setCode(newCode);
        return;
      }

      if (index > 0) {
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    applyDigitsFrom(index, pastedData);
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
        <p className='text-text text-sm'>
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
            key={`confirm-otp-${index}`}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputMode='numeric'
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            autoFocus={index === 0}
            onChange={e => handleInputChange(index, e)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={e => handlePaste(index, e)}
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
