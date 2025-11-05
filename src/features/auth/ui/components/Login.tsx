import { Form, Formik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import { useNotifications } from 'widgets';

import { useLoginMutation } from 'app/store/api';
import { usePasswordVisibility } from 'features/auth/hooks';
import { createAuthValidationSchemas } from 'features/auth/model/validationSchemas';
import { PasswordVisibilityToggle } from 'features/auth/ui/components/PasswordVisibilityToggle';
import { ValidatedField } from 'features/form/ui/ValidatedField';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useMobileForm } from 'widgets/hooks/useMobileForm';

type LoginProps = {
  onSwitchToRegister?: () => void;
};

export const Login: React.FC<LoginProps> = () => {
  const { showError } = useNotifications();
  const [login, { isLoading: isSubmitting }] = useLoginMutation();

  const navigate = useNavigate();
  const passwordVisibility = usePasswordVisibility();
  const { t } = useLocalization();

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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginValidationSchema}
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
            {t('auth:login.title')}
          </h2>

          <div className='space-y-6'>
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
                  {t('auth:login.submitting')}
                </div>
              ) : (
                t('auth:login.submit')
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
