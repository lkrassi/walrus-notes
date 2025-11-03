import { Form, Formik } from 'formik';
import React from 'react';
import { Button } from 'shared';
import { useNotifications } from 'widgets';

import { usePasswordVisibility } from 'features/auth/hooks';
import { PasswordVisibilityToggle } from 'features/auth/ui/components/PasswordVisibilityToggle';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useRegisterMutation } from 'widgets/model/stores/api';

import { createAuthValidationSchemas } from 'features/auth/model/validationSchemas';
import { useMobileForm } from 'widgets/hooks/useMobileForm';
import { ValidatedField } from 'features/form/ui/ValidatedField';

type RegisterProps = {
  onSwitchToLogin?: () => void;
};

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { showSuccess, showError } = useNotifications();
  const [register, { isLoading: isSubmitting }] = useRegisterMutation();
  const passwordVisibility = usePasswordVisibility();
  const { t } = useLocalization();

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
      showSuccess(t('auth:register.success'));

      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch {
      showError(t('auth:register.error'));
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
        <Form
          ref={formRef}
          className='border-border dark:border-dark-border bg-gradient rounded-2xl border p-8 shadow-sm backdrop-blur-sm'
        >
          <h2 className='text-text dark:text-dark-text mb-8 text-center text-3xl font-light tracking-tight'>
            {t('auth:register.title')}
          </h2>

          <div className='space-y-6'>
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
              inputClassName='pr-12'
            >
              <div className='absolute top-1/2 right-3 -translate-y-2/3 transform'>
                <PasswordVisibilityToggle
                  isVisible={passwordVisibility.isVisible}
                  onToggle={passwordVisibility.toggleVisibility}
                />
              </div>
            </ValidatedField>

            <Button
              type='submit'
              disabled={formikSubmitting || isSubmitting}
              className='w-full px-8 py-3'
            >
              {formikSubmitting || isSubmitting ? (
                <div className='flex items-center justify-center'>
                  <div className='mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
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
