import { useRegisterMutation, useSendConfirmCodeMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { Button, Input, Skeleton } from '@/shared';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalContext } from '@/shared/lib/react';
import { useMobileForm } from '@/shared/lib/react/hooks';
import type { FieldProps } from 'formik';
import { Field, Form, Formik } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import { type FC, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePasswordVisibility } from '../../lib/hooks';
import { createAuthValidationSchemas } from '../../model/validationSchemas';
const ConfirmCodeModal = lazy(() =>
  import('./ConfirmCodeModal').then(m => ({
    default: m.ConfirmCodeModal,
  }))
);

type RegisterProps = {
  onSwitchToLogin?: () => void;
};

export const Register: FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { showSuccess, showError } = useNotifications();
  const [register, { isLoading: isSubmitting }] = useRegisterMutation();
  const [sendConfirmCode] = useSendConfirmCodeMutation();
  const confirmPasswordVisibility = usePasswordVisibility();
  const { t } = useTranslation();
  const { openModal, closeModal } = useModalContext();

  const { formRef } = useMobileForm();

  const { registerValidationSchema } = createAuthValidationSchemas(t);
  const confirmPasswordPlaceholder = t(
    'auth:register.confirmPasswordPlaceholder'
  );
  const passwordVisibility = usePasswordVisibility();
  const initialValues = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    acceptPersonalData: false,
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const {
        confirmPassword: _confirmPassword,
        acceptPersonalData: _acceptPersonalData,
        ...registerPayload
      } = values;
      await register(registerPayload).unwrap();

      try {
        await sendConfirmCode({
          email: values.email,
          password: values.password,
        }).unwrap();

        const handleConfirmSuccess = () => {
          closeModal();
          showSuccess(t('auth:register.success'));
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        };

        openModal(
          <Suspense
            fallback={
              <div className={cn('space-y-4', 'p-6')}>
                <Skeleton className='mx-auto h-7 w-56 max-w-full' />
                <Skeleton className='h-12 w-full rounded-xl' />
                <Skeleton className='h-12 w-full rounded-xl' />
                <Skeleton className='h-11 w-full rounded-xl' />
              </div>
            }
          >
            <ConfirmCodeModal
              email={values.email}
              onSuccess={handleConfirmSuccess}
            />
          </Suspense>,
          {
            title: t('auth:confirmCode.title') || 'Подтверждение почты',
            size: MODAL_SIZE_PRESETS.authConfirmCode,
            closeOnOverlayClick: false,
            closeOnEscape: false,
            showCloseButton: false,
          }
        );
      } catch {
        showError(t('auth:register.error'));
      }
    } catch (err) {
      const e: unknown = err;
      const getStringAt = (
        root: unknown,
        path: string[]
      ): string | undefined => {
        let cur: unknown = root;
        for (const p of path) {
          if (!cur || typeof cur !== 'object') return undefined;
          cur = (cur as Record<string, unknown>)[p];
        }
        return typeof cur === 'string' ? cur : undefined;
      };

      const errorCode =
        getStringAt(e, ['data', 'meta', 'code']) ||
        getStringAt(e, ['data', 'code']);
      const serverMessage =
        getStringAt(e, ['data', 'meta', 'message']) ||
        getStringAt(e, ['data', 'message']) ||
        getStringAt(e, ['error']);
      const status = (
        e && typeof e === 'object'
          ? (e as Record<string, unknown>)['status']
          : undefined
      ) as number | undefined;

      const conflictCodes = [
        'user_exists',
        'user_already_exists',
        'email_exists',
        'email_already_exists',
        'username_exists',
        'username_already_exists',
      ];

      const serverMessageLower = serverMessage
        ? String(serverMessage).toLowerCase()
        : '';
      const conflictSubstrings = [
        'not unique',
        'already exists',
        'duplicate',
        'email already',
        'username already',
      ];

      const serverIndicatesConflict = conflictSubstrings.some(s =>
        serverMessageLower.includes(s)
      );

      if (
        status === 409 ||
        (errorCode && conflictCodes.includes(errorCode)) ||
        serverIndicatesConflict
      ) {
        showError(
          t('auth:register.errorTaken') ||
            'Пользователь с таким email или именем уже существует'
        );
      } else if (serverMessage) {
        showError(String(serverMessage));
      } else {
        showError(t('auth:register.error'));
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registerValidationSchema}
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
              'mx-auto w-full max-w-md rounded-2xl border p-4 backdrop-blur-xl'
            )}
          >
            <h2
              className={cn(
                'text-text mb-3 text-center text-2xl font-bold',
                'dark:text-dark-text'
              )}
            >
              {t('auth:register.title')}
            </h2>

            <div className='flex flex-col gap-3'>
              <Field name='email'>
                {({ field, meta }: FieldProps<string>) => (
                  <div className='space-y-1'>
                    <label className='tw-label'>
                      {t('auth:register.email')}
                    </label>
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

              <Field name='username'>
                {({ field, meta }: FieldProps<string>) => (
                  <div className='space-y-1'>
                    <label className='tw-label'>
                      {t('auth:register.username')}
                    </label>
                    <Input
                      {...field}
                      type='text'
                      placeholder={t('auth:register.usernamePlaceholder')}
                      autoComplete='username'
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
                      {t('auth:register.password')}
                    </label>
                    <div className='relative'>
                      <Input
                        {...field}
                        type={
                          passwordVisibility.isVisible ? 'text' : 'password'
                        }
                        placeholder={t('auth:login.passwordPlaceholder')}
                        autoComplete='new-password'
                        required
                        disabled={formikSubmitting || isSubmitting}
                        aria-invalid={meta.touched && Boolean(meta.error)}
                        className='form-input pr-10'
                      />
                      <button
                        type='button'
                        onClick={passwordVisibility.toggleVisibility}
                        className='text-muted-foreground hover:bg-interactive-hover hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1 focus-visible:ring-2 focus-visible:outline-none'
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

              <Field name='confirmPassword'>
                {({ field, meta }: FieldProps<string>) => (
                  <div className='space-y-1'>
                    <label className='tw-label'>
                      {t('auth:register.confirmPassword')}
                    </label>
                    <div className='relative'>
                      <Input
                        {...field}
                        type={
                          confirmPasswordVisibility.isVisible
                            ? 'text'
                            : 'password'
                        }
                        placeholder={confirmPasswordPlaceholder}
                        autoComplete='new-password'
                        required
                        disabled={formikSubmitting || isSubmitting}
                        aria-invalid={meta.touched && Boolean(meta.error)}
                        className='form-input pr-10'
                      />
                      <button
                        type='button'
                        onClick={confirmPasswordVisibility.toggleVisibility}
                        className='text-muted-foreground hover:bg-interactive-hover hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1 focus-visible:ring-2 focus-visible:outline-none'
                        aria-label={
                          confirmPasswordVisibility.isVisible
                            ? t('common:password.hide')
                            : t('common:password.show')
                        }
                        disabled={formikSubmitting || isSubmitting}
                      >
                        {confirmPasswordVisibility.isVisible ? (
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

              <Field name='acceptPersonalData' type='checkbox'>
                {({ field, meta }: FieldProps<boolean>) => (
                  <div className='space-y-1'>
                    <label
                      className={cn(
                        'border-border dark:border-dark-border bg-bg/60 dark:bg-dark-bg/60',
                        'flex items-start gap-3 rounded-xl border p-3 text-sm'
                      )}
                    >
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        className='border-border text-primary focus:ring-primary mt-1 h-4 w-4 rounded'
                        disabled={formikSubmitting || isSubmitting}
                        required
                      />
                      <span className='text-muted-foreground leading-relaxed'>
                        {t('auth:register.personalDataConsent')}{' '}
                        <Link
                          to='/consent'
                          className='text-primary underline underline-offset-4 hover:opacity-80'
                        >
                          {t('auth:register.personalDataConsentLink')}
                        </Link>
                      </span>
                    </label>
                    <p className='text-danger-foreground min-h-5 text-xs'>
                      {meta.touched && meta.error ? meta.error : ' '}
                    </p>
                  </div>
                )}
              </Field>

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
                    {t('auth:register.submitting')}
                  </span>
                ) : (
                  t('auth:register.submit')
                )}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
