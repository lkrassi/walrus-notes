import { Form, Formik, Field } from 'formik';
import type { FieldProps } from 'formik';
import React from 'react';
import { Button } from 'shared';
import { useNotifications } from 'widgets';

import { useRegisterMutation, useSendConfirmCodeMutation } from 'app/store/api';
import { usePasswordVisibility } from 'features/auth/hooks';
import { PasswordVisibilityToggle } from 'features/auth/ui/components/PasswordVisibilityToggle';
import { ConfirmCodeModal } from 'features/auth/ui/components/ConfirmCodeModal';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';

import { createAuthValidationSchemas } from 'features/auth/model/validationSchemas';
import { useMobileForm } from 'widgets/hooks/useMobileForm';
import { Box, TextField, Typography, CircularProgress } from '@mui/material';

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
      validateOnMount={true}
    >
      {({ isSubmitting: formikSubmitting, isValid, dirty }) => (
        <Form ref={formRef}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 448,
              mx: 'auto',
              p: 4,
              borderRadius: 2,
              bgcolor: theme =>
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[900]
                  : theme.palette.background.paper,
              boxShadow: 3,
            }}
          >
            <Typography
              variant='h4'
              component='h2'
              sx={{
                mb: 3,
                fontWeight: 700,
                textAlign: 'center',
                color: theme =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[100]
                    : theme.palette.text.primary,
              }}
            >
              {t('auth:register.title')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Field name='email'>
                {({ field, meta }: FieldProps<string>) => (
                  <TextField
                    {...field}
                    label={t('auth:register.email')}
                    type='email'
                    placeholder={t('auth:login.emailPlaceholder')}
                    inputMode='email'
                    autoComplete='email'
                    required
                    fullWidth
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    disabled={formikSubmitting || isSubmitting}
                  />
                )}
              </Field>

              <Field name='username'>
                {({ field, meta }: FieldProps<string>) => (
                  <TextField
                    {...field}
                    label={t('auth:register.username')}
                    type='text'
                    placeholder={t('auth:register.usernamePlaceholder')}
                    autoComplete='username'
                    fullWidth
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    disabled={formikSubmitting || isSubmitting}
                  />
                )}
              </Field>

              <Field name='password'>
                {({ field, meta }: FieldProps<string>) => (
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      {...field}
                      label={t('auth:register.password')}
                      type={passwordVisibility.isVisible ? 'text' : 'password'}
                      placeholder={t('auth:login.passwordPlaceholder')}
                      autoComplete='current-password'
                      required
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      disabled={formikSubmitting || isSubmitting}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: meta.touched && meta.error ? '28%' : '50%',
                        right: 8,
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                      }}
                    >
                      <PasswordVisibilityToggle
                        isVisible={passwordVisibility.isVisible}
                        onToggle={passwordVisibility.toggleVisibility}
                      />
                    </Box>
                  </Box>
                )}
              </Field>

              <Button
                type='submit'
                disabled={
                  formikSubmitting || isSubmitting || !isValid || !dirty
                }
                style={{ width: '100%', padding: '12px 32px' }}
              >
                {formikSubmitting || isSubmitting ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: 'inherit' }}
                    />
                    {t('auth:register.submitting')}
                  </Box>
                ) : (
                  t('auth:register.submit')
                )}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};
