import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useNotifications } from 'widgets';

import { useRegisterMutation, useSendConfirmCodeMutation } from 'app/store/api';
import { usePasswordVisibility } from 'features/auth/hooks';
import { PasswordVisibilityToggle } from 'features/auth/ui/components/PasswordVisibilityToggle';
import { ConfirmCodeModal } from 'features/auth/ui/components/ConfirmCodeModal';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';

import { createAuthValidationSchemas } from 'features/auth/model/validationSchemas';
import { ValidatedField } from 'features/form/ui/ValidatedField';
import { useMobileForm } from 'widgets/hooks/useMobileForm';

type RegisterProps = {
  onSwitchToLogin?: () => void;
};

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { showSuccess, showError } = useNotifications();
  const [register, { isLoading: isSubmitting }] = useRegisterMutation();
  const [sendConfirmCode] = useSendConfirmCodeMutation();
  const passwordVisibility = usePasswordVisibility();
  const { t } = useLocalization();
  const { openModal, closeModal } = useModalContext();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const { formRef } = useMobileForm();

  const { registerValidationSchema } = createAuthValidationSchemas(t);

  const initialValues = {
    email: '',
    username: '',
    password: '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await register(values).unwrap();
      setRegisteredEmail(values.email);

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
          <ConfirmCodeModal
            email={values.email}
            onSuccess={handleConfirmSuccess}
          />,
          {
            title: t('auth:confirmCode.title') || 'Подтверждение почты',
            size: 'md',
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
    >
      {({ isSubmitting: formikSubmitting }) => (
        <Form ref={formRef} className={cn('form-card')}>
          <h2 className={cn('hero-title')}>{t('auth:register.title')}</h2>

          <div className={cn('space-y-6')}>
            <ValidatedField
              name='email'
              label={t('auth:register.email')}
              type='email'
              placeholder={t('auth:login.emailPlaceholder')}
              inputMode='email'
              autoComplete='email'
              enterKeyHint='next'
              required
            />

            <ValidatedField
              name='username'
              label={t('auth:register.username')}
              type='text'
              placeholder={t('auth:register.usernamePlaceholder')}
              autoComplete='username'
              enterKeyHint='next'
            />

            <ValidatedField
              name='password'
              label={t('auth:register.password')}
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

            <Button
              type='submit'
              disabled={formikSubmitting || isSubmitting}
              className={cn('w-full', 'px-8', 'py-3')}
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
                  {t('auth:register.submitting')}
                </div>
              ) : (
                t('auth:register.submit')
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
