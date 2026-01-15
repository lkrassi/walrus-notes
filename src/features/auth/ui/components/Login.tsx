import { Form, Formik, Field } from 'formik';
import type { FieldProps } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import { useNotifications } from 'widgets';

import { useLoginMutation, useForgotPasswordMutation } from 'app/store/api';
import { setTokens, setUserProfile } from 'app/store/slices/userSlice';
import { useAppDispatch } from 'widgets/hooks/redux';
import { usePasswordVisibility } from 'features/auth/hooks';
import { createAuthValidationSchemas } from 'features/auth/model/validationSchemas';
import { ResetPasswordModal } from 'features/auth/ui/components/ResetPasswordModal';
import { ForgotPasswordEmailModal } from 'features/auth/ui/components/ForgotPasswordEmailModal';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';
import { useMobileForm } from 'widgets/hooks/useMobileForm';
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type LoginProps = {
  onSwitchToRegister?: () => void;
};

export const Login: React.FC<LoginProps> = () => {
  const dispatch = useAppDispatch();
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

      // Используем Redux action для синхронизации токенов
      dispatch(
        setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        })
      );

      // Сохраняем базовые данные в Redux store
      dispatch(
        setUserProfile({
          id: response.data.userId,
          username: '',
          email: values.email,
          imgUrl: '',
          role: 'user',
          createdAt: new Date().toISOString(),
        })
      );

      // Оставляем localStorage для обратной совместимости (будет удалено позже)
      localStorage.setItem('userId', response.data.userId);
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
              backdropFilter: 'blur(20px)',
              backgroundColor: theme =>
                theme.palette.mode === 'dark'
                  ? 'rgba(17, 24, 39, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
              border: theme =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: theme =>
                theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.6)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
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
              {t('auth:login.title')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Field name='email'>
                {({ field, meta }: FieldProps<string>) => (
                  <TextField
                    {...field}
                    label={t('auth:login.email')}
                    type='email'
                    placeholder={t('auth:login.emailPlaceholder')}
                    inputMode='email'
                    autoComplete='email'
                    required
                    fullWidth
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error ? meta.error : ' '}
                    disabled={formikSubmitting || isSubmitting}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        height: '1.25rem',
                        margin: '4px 14px 0 14px',
                      },
                    }}
                  />
                )}
              </Field>

              <Field name='password'>
                {({ field, meta }: FieldProps<string>) => (
                  <TextField
                    {...field}
                    label={t('auth:login.password')}
                    type={passwordVisibility.isVisible ? 'text' : 'password'}
                    placeholder={t('auth:login.passwordPlaceholder')}
                    autoComplete='current-password'
                    required
                    fullWidth
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error ? meta.error : ' '}
                    disabled={formikSubmitting || isSubmitting}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        height: '1.25rem',
                        margin: '4px 14px 0 14px',
                      },
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={passwordVisibility.toggleVisibility}
                              edge='end'
                              aria-label={
                                passwordVisibility.isVisible
                                  ? t('common:password.hide')
                                  : t('common:password.show')
                              }
                              disabled={formikSubmitting || isSubmitting}
                            >
                              {passwordVisibility.isVisible ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              </Field>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Button
                  type='submit'
                  disabled={
                    formikSubmitting || isSubmitting || !isValid || !dirty
                  }
                  style={{ flex: 1, padding: '12px 32px' }}
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
                      {t('auth:login.submitting')}
                    </Box>
                  ) : (
                    t('auth:login.submit')
                  )}
                </Button>
                <Typography
                  component='button'
                  type='button'
                  onClick={handleForgotPassword}
                  sx={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: theme =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[100]
                        : theme.palette.text.primary,
                    '&:hover': { textDecoration: 'underline' },
                    '&:focus': { textDecoration: 'underline' },
                  }}
                  title={t('auth:login.forgotPassword') || 'Забыл пароль'}
                >
                  {t('auth:login.forgotPassword')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};
