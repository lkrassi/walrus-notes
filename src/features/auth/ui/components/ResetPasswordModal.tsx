import React, { useState, useRef, useEffect } from 'react';
import cn from 'shared/lib/cn';
import { useConfirmCodeMutation } from 'app/store/api';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { Button } from 'shared';
import { PasswordVisibilityToggle } from './PasswordVisibilityToggle';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import 'features/auth/model/validationSchemas';
import { ValidatedField } from 'features/form/ui/ValidatedField';

interface ResetPasswordModalProps {
  email: string;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  email,
  onSuccess,
}) => {
  const { t } = useLocalization();
  const { showError } = useNotifications();
  const [confirmCode] = useConfirmCodeMutation();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

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

  const handleSubmit = async (values: { newPassword: string }) => {
    const codeString = code.join('');

    if (codeString.length !== 6) {
      setError(
        t('auth:resetPassword.error.incomplete') || 'Введите полный код'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmCode({
        email,
        code: codeString,
        newPassword: values.newPassword,
      }).unwrap();

      onSuccess();
    } catch (err) {
      const errorData = err as { data?: { meta?: { code?: string } } };
      const errorCode = errorData?.data?.meta?.code || 'unknown_error';
      let errorMessage =
        t('auth:resetPassword.error.invalid') || 'Ошибка при сбросе пароля';

      if (errorCode === 'confirm_code_incorrect') {
        errorMessage =
          t('auth:resetPassword.error.incorrectCode') ||
          'Неверный код подтверждения';
        showError(errorMessage);
      } else if (errorCode === 'confirm_code_not_exist') {
        errorMessage =
          t('auth:resetPassword.error.codeNotExist') || 'Код не существует';
        showError(errorMessage);
      } else if (errorCode === 'user_not_found') {
        errorMessage =
          t('auth:resetPassword.error.userNotFound') ||
          'Пользователь не найден';
      } else if (errorCode === 'no_new_password') {
        errorMessage =
          t('auth:resetPassword.error.passwordRequired') ||
          'Введите новый пароль';
      }

      setError(errorMessage);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
          {t('auth:resetPassword.description') ||
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
              error && 'border-red-500',
              digit && 'border-primary',
              'dark:focus:border-primary'
            )}
            disabled={isLoading}
          />
        ))}
      </div>

      <Formik
        initialValues={{ newPassword: '' }}
        validationSchema={Yup.object({
          newPassword: Yup.string()
            .passwordStrength(
              t('auth:validation.passwordStrength') ||
                'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы'
            )
            .noCommonPasswords(
              t('auth:validation.passwordCommon') ||
                'Этот пароль слишком простой и часто используется. Выберите более надежный пароль'
            )
            .required(
              t('auth:resetPassword.error.passwordRequired') ||
                'Введите новый пароль'
            ),
        })}
        onSubmit={handleSubmit}
        validateOnMount
        validateOnChange={true}
        validateOnBlur={true}
      >
        {formik => (
          <Form className={cn('w-full', 'flex', 'flex-col', 'gap-y-5')}>
            <div className={cn('relative')}>
              <ValidatedField
                name='newPassword'
                label={
                  t('auth:resetPassword.newPasswordLabel') || 'Новый пароль'
                }
                type={showPassword ? 'text' : 'password'}
                placeholder={
                  t('auth:login.passwordPlaceholder') || 'Введите новый пароль'
                }
                required
              >
                <div
                  className={cn(
                    'absolute',
                    'top-1/2',
                    'right-3',
                    '-translate-y-1/2'
                  )}
                >
                  <PasswordVisibilityToggle
                    isVisible={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </ValidatedField>
            </div>

            <div className={cn('flex', 'justify-center')}>
              <Button
                type='submit'
                variant={
                  isLoading || code.join('').length !== 6 || !formik.isValid
                    ? 'disabled'
                    : 'submit'
                }
                disabled={
                  isLoading || code.join('').length !== 6 || !formik.isValid
                }
                className={cn('w-full', 'px-8', 'py-3')}
              >
                {isLoading
                  ? t('auth:confirmCode.loading')
                  : t('auth:confirmCode.submit')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
