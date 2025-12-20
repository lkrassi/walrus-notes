import { Form, Formik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useNotifications } from 'widgets';

import { useLoginMutation, useForgotPasswordMutation } from 'app/store/api';
import { usePasswordVisibility } from 'features/auth/hooks';
import { createAuthValidationSchemas } from 'features/auth/model/validationSchemas';
import { PasswordVisibilityToggle } from 'features/auth/ui/components/PasswordVisibilityToggle';
import { ResetPasswordModal } from 'features/auth/ui/components/ResetPasswordModal';
import { ForgotPasswordEmailModal } from 'features/auth/ui/components/ForgotPasswordEmailModal';
import { ValidatedField } from 'features/form/ui/ValidatedField';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';
import { useMobileForm } from 'widgets/hooks/useMobileForm';

type LoginProps = {
  onSwitchToRegister?: () => void;
};

export const Login: React.FC<LoginProps> = () => {
  const { showError, showSuccess } = useNotifications();
  const [login, { isLoading: isSubmitting }] = useLoginMutation();
  const [forgotPassword] = useForgotPasswordMutation();

  const navigate = useNavigate();
  const passwordVisibility = usePasswordVisibility();
  const { t } = useLocalization();
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
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', response.data.userId);

      window.dispatchEvent(new Event('tokenSet'));
      navigate('/dashboard');
    } catch {
      showError(t('auth:login.error'));
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
              size: 'md',
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
            showError(
              t('auth:resetPassword.error.failed') || 'Ошибка при отправке кода'
            );
          }
          throw err;
        }
      }}
    />,
    {
      title: t('auth:forgotPasswordEmail.title') || 'Восстановление пароля',
      size: 'sm',
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
    >
      {({ isSubmitting: formikSubmitting }) => (
        <Form ref={formRef} className={cn('form-card')}>
          <h2 className={cn('hero-title')}>{t('auth:login.title')}</h2>

          <div className={cn('space-y-6')}>
            <ValidatedField
              name='email'
              label={t('auth:login.email')}
              type='email'
              placeholder={t('auth:login.emailPlaceholder')}
              inputMode='email'
              autoComplete='email'
              enterKeyHint='next'
              required
            />

            <ValidatedField
              name='password'
              label={t('auth:login.password')}
              type={passwordVisibility.isVisible ? 'text' : 'password'}
              placeholder={t('auth:login.passwordPlaceholder')}
              autoComplete='current-password'
              enterKeyHint='done'
              required
              inputClassName={cn('pr-12')}
            >
              <div
                className={cn(
                  'absolute',
                  'top-1/2',
                  'right-3',
                  '-translate-y-2/3',
                  'transform'
                )}
              >
                <PasswordVisibilityToggle
                  isVisible={passwordVisibility.isVisible}
                  onToggle={passwordVisibility.toggleVisibility}
                />
              </div>
            </ValidatedField>

            <div className={cn('flex', 'flex-col', 'gap-5')}>
              <Button
                type='submit'
                disabled={formikSubmitting || isSubmitting}
                className={cn('flex-1', 'px-8', 'py-3')}
              >
                {formikSubmitting || isSubmitting ? (
                  <div className={cn('flex', 'items-center', 'justify-center')}>
                    <div
                      className={cn(
                        'mr-2',
                        'h-5',
                        'w-5',
                        'animate-spin',
                        'rounded-full',
                        'border-2',
                        'border-white',
                        'border-t-transparent'
                      )}
                    ></div>
                    {t('auth:login.submitting')}
                  </div>
                ) : (
                  t('auth:login.submit')
                )}
              </Button>
              <button
                type='button'
                onClick={handleForgotPassword}
                className={cn(
                  'text-text',
                  'dark:text-dark-text',
                  'hover:underline focus:underline'
                )}
                title={t('auth:login.forgotPassword') || 'Забыл пароль'}
              >
                {t('auth:login.forgotPassword')}
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
