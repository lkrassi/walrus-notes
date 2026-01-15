import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'shared';
import { useLocalization } from 'widgets/hooks';
import { Formik, Form, Field } from 'formik';
import type { FieldProps } from 'formik';
import * as Yup from 'yup';
import { useModalContentContext } from 'widgets/ui';
import { TextField, Box, Typography, CircularProgress } from '@mui/material';

interface ForgotPasswordEmailModalProps {
  onSubmit: (email: string) => Promise<void>;
}

export const ForgotPasswordEmailModal: React.FC<
  ForgotPasswordEmailModalProps
> = ({ onSubmit }) => {
  const { t } = useLocalization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeModal } = useModalContentContext();
  const emailFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      emailFieldRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('auth:validation.emailInvalid'))
      .required(t('auth:validation.emailRequired')),
  });

  const handleSubmit = async (values: { email: string }) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}
    >
      <Typography
        variant='body2'
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        {t('auth:forgotPasswordEmail.description') ||
          'Введите адрес электронной почты для восстановления пароля'}
      </Typography>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        validateOnMount={false}
      >
        {({ isValid, dirty }) => (
          <Form
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <Field name='email'>
              {({ field, meta }: FieldProps<string>) => (
                <TextField
                  {...field}
                  inputRef={emailFieldRef}
                  label={t('auth:login.email')}
                  type='email'
                  placeholder={t('auth:login.emailPlaceholder')}
                  required
                  fullWidth
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error ? meta.error : ' '}
                  disabled={isSubmitting}
                  autoComplete='email'
                  slotProps={{
                    htmlInput: {
                      inputMode: 'email',
                    },
                  }}
                  sx={{
                    '& .MuiFormHelperText-root': {
                      height: '1.25rem',
                      margin: '4px 14px 0 14px',
                    },
                  }}
                />
              )}
            </Field>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
              <Button
                type='button'
                onClick={closeModal}
                variant='escape'
                disabled={isSubmitting}
              >
                {t('common:buttons.cancel') || 'Отмена'}
              </Button>
              <Button
                type='submit'
                variant={
                  isSubmitting || !isValid || !dirty ? 'disabled' : 'submit'
                }
                disabled={isSubmitting || !isValid || !dirty}
              >
                {isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color='inherit' />
                    {t('auth:forgotPasswordEmail.sending') || 'Отправка...'}
                  </Box>
                ) : (
                  t('auth:forgotPasswordEmail.submit') || 'Отправить код'
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
