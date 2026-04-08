import { useConfirmCodeMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { Button, Input } from '@/shared';
import { cn } from '@/shared/lib/core';
import 'features/auth/model/validationSchemas';
import type { FieldProps } from 'formik';
import { Field, Form, Formik } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import {
  type ClipboardEvent,
  type FC,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

interface ResetPasswordModalProps {
  email: string;
  onSuccess: () => void;
}

export const ResetPasswordModal: FC<ResetPasswordModalProps> = ({
  email,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const [confirmCode] = useConfirmCodeMutation();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (values: { newPassword: string }) => {
    const codeString = code.join('');

    setIsLoading(true);

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
        errorMessage = t('auth:resetPassword.error.codeNotExist');
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
    <div className='flex w-full flex-col gap-3 p-6'>
      <div className='text-center'>
        <p className='text-secondary dark:text-dark-secondary text-sm'>
          {t('auth:resetPassword.description') ||
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
            key={`reset-otp-${index}`}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputMode='numeric'
            value={digit}
            autoFocus={index === 0}
            onChange={e =>
              handleInputChange(index, (e.target as HTMLInputElement).value)
            }
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            maxLength={1}
            className={cn('h-12 w-12 px-0 text-center text-lg font-semibold')}
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
          <Form className='flex w-full flex-col gap-5'>
            <Field name='newPassword'>
              {({ field, meta }: FieldProps<string>) => (
                <div className='space-y-1'>
                  <label className='tw-label'>
                    {t('auth:resetPassword.newPasswordLabel') || 'Новый пароль'}
                  </label>
                  <div className='relative'>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={
                        t('auth:login.passwordPlaceholder') ||
                        'Введите новый пароль'
                      }
                      required
                      disabled={isLoading}
                      aria-invalid={meta.touched && Boolean(meta.error)}
                      className='form-input pr-10'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='text-muted-foreground hover:bg-interactive-hover hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus-visible:ring-2 focus-visible:outline-none'
                      aria-label={
                        showPassword
                          ? t('common:password.hide')
                          : t('common:password.show')
                      }
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className='text-danger-foreground min-h-5 text-xs'>
                    {meta.touched && meta.error ? meta.error : ' '}
                  </p>
                </div>
              )}
            </Field>

            <div className='flex justify-center'>
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
                className='btn w-full max-w-xs'
              >
                {isLoading ? (
                  <span className='h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white' />
                ) : (
                  t('auth:confirmCode.submit')
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
