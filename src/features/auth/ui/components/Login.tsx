import {
  useForgotPasswordMutation,
  useLazyGetUserProfileQuery,
  useLoginMutation,
  useUser,
} from '@/entities';
import { useNotifications } from '@/entities/notification';
import { Button, Input } from '@/shared';
import { cn } from '@/shared/lib/core';
import {
  MODAL_SIZE_PRESETS,
  useModalActions,
  useModalContext,
} from '@/shared/lib/react';
import { useMobileForm } from '@/shared/lib/react/hooks';
import type { FieldProps } from 'formik';
import { Field, Form, Formik } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePasswordVisibility } from '../../lib/hooks';
import { createAuthValidationSchemas } from '../../model/validationSchemas';
import { ForgotPasswordEmailModal } from './ForgotPasswordEmailModal';
import { ResetPasswordModal } from './ResetPasswordModal';

type LoginProps = {
  onSwitchToRegister?: () => void;
};

const getStringAtPath = (source: unknown, path: string[]): string | null => {
  let current: unknown = source;

  for (const key of path) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' && current.length > 0 ? current : null;
};

const extractLoginPayload = (response: unknown) => {
  const accessToken =
    getStringAtPath(response, ['data', 'accessToken']) ??
    getStringAtPath(response, ['data', 'tokens', 'accessToken']) ??
    getStringAtPath(response, ['accessToken']);

  const refreshToken =
    getStringAtPath(response, ['data', 'refreshToken']) ??
    getStringAtPath(response, ['data', 'tokens', 'refreshToken']) ??
    getStringAtPath(response, ['refreshToken']);

  const userId =
    getStringAtPath(response, ['data', 'userId']) ??
    getStringAtPath(response, ['data', 'user', 'id']) ??
    getStringAtPath(response, ['userId']);

  return { accessToken, refreshToken, userId };
};

export const Login: FC<LoginProps> = () => {
  const { setAuthTokens, updateProfile } = useUser();
  const [triggerGetProfile] = useLazyGetUserProfileQuery();
  const { showError, showSuccess } = useNotifications();
  const [login, { isLoading: isSubmitting }] = useLoginMutation();
  const [forgotPassword] = useForgotPasswordMutation();

  const navigate = useNavigate();
  const passwordVisibility = usePasswordVisibility();
  const { t } = useTranslation();
  const { openModal, closeModal } = useModalContext();
  const { openModalFromTrigger } = useModalActions();

  const { formRef } = useMobileForm();

  const { loginValidationSchema } = createAuthValidationSchemas(t);

  const initialValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const response = await login(values).unwrap();
      const { accessToken, refreshToken, userId } =
        extractLoginPayload(response);

      if (!accessToken || !refreshToken || !userId) {
        showError(
          t('auth:login.error.invalidResponse') ||
            'Не удалось завершить вход. Пожалуйста, попробуйте снова.'
        );
        return;
      }

      localStorage.setItem('userId', userId);

      setAuthTokens({
        accessToken,
        refreshToken,
      });

      const profileResult = await triggerGetProfile(userId).unwrap();
      if (profileResult && profileResult.data) {
        updateProfile(profileResult.data);
      } else {
        updateProfile({
          id: userId,
          username: '',
          email: values.email,
          imgUrl: '',
          role: 'USER',
          createdAt: new Date().toISOString(),
        });
      }
      navigate('/main');
    } catch {
      showError(t('auth:login.error.invalid'));
    }
  };

  const handleForgotPassword = openModalFromTrigger(
    <ForgotPasswordEmailModal
      onSubmit={async (email: string) => {
        try {
          await forgotPassword({ email }).unwrap();
          closeModal();

          const handleResetSuccess = () => {
            closeModal();
            showSuccess(
              t('auth:resetPassword.success') || 'Пароль успешно изменен!'
            );
          };

          openModal(
            <ResetPasswordModal email={email} onSuccess={handleResetSuccess} />,
            {
              title: t('auth:resetPassword.title') || 'Сброс пароля',
              size: MODAL_SIZE_PRESETS.authResetPassword,
              closeOnOverlayClick: false,
              closeOnEscape: false,
              showCloseButton: false,
            }
          );
        } catch (err) {
          const errorData = err as { data?: { meta?: { code?: string } } };
          const errorCode = errorData?.data?.meta?.code || 'unknown_error';

          if (errorCode === 'user_not_found') {
            showError(
              t('auth:resetPassword.error.userNotFound') ||
                'Пользователь не найден'
            );
          } else if (errorCode === 'confirm_code_already_send') {
            showError(
              t('auth:resetPassword.error.codeSent') ||
                'Код уже отправлен, попробуйте позже'
            );
          } else {
            showError(t('auth:resetPassword.error.failed'));
          }
          throw err;
        }
      }}
    />,
    {
      title: t('auth:forgotPasswordEmail.title') || 'Восстановление пароля',
      size: MODAL_SIZE_PRESETS.authForgotPasswordEmail,
      closeOnOverlayClick: true,
      closeOnEscape: true,
      showCloseButton: true,
    }
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginValidationSchema}
      onSubmit={handleSubmit}
      validateOnChange={true}
      validateOnBlur={true}
      validateOnMount={true}
    >
      {({ isSubmitting: formikSubmitting, isValid, dirty }) => (
        <Form ref={formRef}>
          <div
            className={cn(
              'border-border dark:border-dark-border bg-bg/70 dark:bg-dark-bg/70',
              'mx-auto w-full max-w-md border p-4 shadow-2xl backdrop-blur-xl'
            )}
          >
            <h2
              className={cn(
                'text-text mb-3 text-center text-2xl font-bold',
                'dark:text-dark-text'
              )}
            >
              {t('auth:login.title')}
            </h2>

            <div className='flex flex-col gap-3'>
              <Field name='email'>
                {({ field, meta }: FieldProps<string>) => (
                  <div className='space-y-1'>
                    <label className='tw-label'>{t('auth:login.email')}</label>
                    <Input
                      {...field}
                      type='email'
                      placeholder={t('auth:login.emailPlaceholder')}
                      autoComplete='email'
                      required
                      disabled={formikSubmitting || isSubmitting}
                      aria-invalid={meta.touched && Boolean(meta.error)}
                      className='form-input'
                    />
                    <p className='text-danger-foreground min-h-5 text-xs'>
                      {meta.touched && meta.error ? meta.error : ' '}
                    </p>
                  </div>
                )}
              </Field>

              <Field name='password'>
                {({ field, meta }: FieldProps<string>) => (
                  <div className='space-y-1'>
                    <label className='tw-label'>
                      {t('auth:login.password')}
                    </label>
                    <div className='relative'>
                      <Input
                        {...field}
                        type={
                          passwordVisibility.isVisible ? 'text' : 'password'
                        }
                        placeholder={t('auth:login.passwordPlaceholder')}
                        autoComplete='current-password'
                        required
                        disabled={formikSubmitting || isSubmitting}
                        aria-invalid={meta.touched && Boolean(meta.error)}
                        className='form-input pr-10'
                      />
                      <button
                        type='button'
                        onClick={passwordVisibility.toggleVisibility}
                        className='text-muted-foreground hover:bg-interactive-hover hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus-visible:ring-2 focus-visible:outline-none'
                        aria-label={
                          passwordVisibility.isVisible
                            ? t('common:password.hide')
                            : t('common:password.show')
                        }
                        disabled={formikSubmitting || isSubmitting}
                      >
                        {passwordVisibility.isVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <p className='text-danger-foreground min-h-5 text-xs'>
                      {meta.touched && meta.error ? meta.error : ' '}
                    </p>
                  </div>
                )}
              </Field>

              <div className='flex flex-col gap-2.5'>
                <Button
                  type='submit'
                  variant={
                    formikSubmitting || isSubmitting || !isValid || !dirty
                      ? 'disabled'
                      : 'default'
                  }
                  disabled={
                    formikSubmitting || isSubmitting || !isValid || !dirty
                  }
                  className='btn w-full'
                >
                  {formikSubmitting || isSubmitting ? (
                    <span className='inline-flex items-center justify-center gap-2'>
                      <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
                      {t('auth:login.submitting')}
                    </span>
                  ) : (
                    t('auth:login.submit')
                  )}
                </Button>
                <button
                  type='button'
                  onClick={handleForgotPassword}
                  className='text-foreground focus-visible:ring-ring rounded border-0 bg-transparent px-1 hover:underline focus-visible:ring-2 focus-visible:outline-none'
                  title={t('auth:login.forgotPassword') || 'Забыл пароль'}
                >
                  {t('auth:login.forgotPassword')}
                </button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
