import React, { useState, useRef, useEffect } from 'react';
import cn from 'shared/lib/cn';
import { useConfirmCodeMutation } from 'app/store/api';
import { useLocalization } from 'widgets/hooks';
import { useNotifications } from 'widgets/hooks';
import { Button } from 'shared';

interface ConfirmCodeModalProps {
  email: string;
  onSuccess: () => void;
}

export const ConfirmCodeModal: React.FC<ConfirmCodeModalProps> = ({
  email,
  onSuccess,
}) => {
  const { t } = useLocalization();
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

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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
      // show localized error for invalid confirmation code
      showError(t('auth:confirmCode.error.invalid') || 'Неверный код');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className={cn('flex', 'flex-col', 'gap-6', 'w-full')}>
      <div className={cn('text-center')}>
        <p
          className={cn(
            'text-sm',
            'text-secondary',
            'dark:text-dark-secondary'
          )}
        >
          {t('auth:confirmCode.description') ||
            'Код подтверждения отправлен на'}
          <br />
          <span
            className={cn('font-semibold', 'text-text', 'dark:text-dark-text')}
          >
            {email}
          </span>
        </p>
      </div>

      <div
        className={cn(
          'flex',
          'gap-2',
          'justify-center',
          'mx-auto',
          'w-full',
          'max-w-xs'
        )}
      >
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={digit}
            onChange={e => handleInputChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'w-12',
              'h-12',
              'text-center',
              'text-lg',
              'font-semibold',
              'border-2',
              'rounded-lg',
              'bg-white',
              'dark:bg-dark-bg',
              'text-text',
              'dark:text-dark-text',
              'border-border',
              'dark:border-dark-border',
              'focus:outline-none',
              'focus:border-primary',
              'dark:focus:border-primary',
              'transition-colors',
              digit && 'border-primary',
              'dark:focus:border-primary'
            )}
            disabled={isLoading}
          />
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || code.join('').length !== 6}
        variant={
          isLoading || code.join('').length !== 6 ? 'disabled' : 'submit'
        }
        className={cn('w-full', 'px-8', 'py-3')}
      >
        {isLoading
          ? t('auth:confirmCode.loading')
          : t('auth:confirmCode.submit')}
      </Button>
    </div>
  );
};
