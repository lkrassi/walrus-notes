import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useConfirmCodeMutation } from 'app/store/api';
import 'features/auth/model/validationSchemas';
import type { FieldProps } from 'formik';
import { Field, Form, Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'shared';
import { useLocalization, useNotifications } from 'widgets/hooks';
import * as Yup from 'yup';

interface ResetPasswordModalProps {
  email: string;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  email,
  onSuccess,
}) => {
  const { t } = useLocalization();
  const { showError } = useNotifications();
  const [confirmCode] = useConfirmCodeMutation();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

    if (codeString.length !== 6) {
      setError(
        t('auth:resetPassword.error.incomplete') || 'Введите полный код'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

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
        errorMessage =
          t('auth:resetPassword.error.codeNotExist') || 'Код не существует';
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

      setError(errorMessage);
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
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant='body2'
          sx={{
            color: theme =>
              theme.palette.mode === 'dark'
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t('auth:resetPassword.description') ||
            'Код подтверждения отправлен на'}
          <br />
          <Typography
            component='span'
            sx={{
              fontWeight: 600,
              color: theme =>
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[100]
                  : theme.palette.text.primary,
            }}
          >
            {email}
          </Typography>
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          mx: 'auto',
          width: '100%',
          maxWidth: 320,
        }}
      >
        {code.map((digit, index) => (
          <TextField
            key={index}
            inputRef={el => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputMode='numeric'
            value={digit}
            autoFocus={index === 0}
            onChange={e => handleInputChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            slotProps={{
              htmlInput: {
                maxLength: 1,
                style: { textAlign: 'center' },
              },
            }}
            sx={{
              width: 48,
              '& .MuiOutlinedInput-root': {
                height: 48,
                fontSize: '1.125rem',
                fontWeight: 600,
                '& input': {
                  textAlign: 'center',
                },
                '&.Mui-focused fieldset': {
                  borderColor: error ? 'error.main' : 'primary.main',
                  borderWidth: 2,
                },
                '& fieldset': {
                  borderWidth: 2,
                  borderColor: error
                    ? 'error.main'
                    : digit
                      ? 'primary.main'
                      : undefined,
                },
              },
            }}
          />
        ))}
      </Box>

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
          <Form
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <Field name='newPassword'>
              {({ field, meta }: FieldProps<string>) => (
                <TextField
                  {...field}
                  label={
                    t('auth:resetPassword.newPasswordLabel') || 'Новый пароль'
                  }
                  type={showPassword ? 'text' : 'password'}
                  placeholder={
                    t('auth:login.passwordPlaceholder') ||
                    'Введите новый пароль'
                  }
                  required
                  fullWidth
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error ? meta.error : ' '}
                  disabled={isLoading}
                  sx={{
                    '& .MuiFormHelperText-root': {
                      height: '1.25rem',
                      margin: '4px 14px 0 14px',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          aria-label={
                            showPassword
                              ? t('common:password.hide')
                              : t('common:password.show')
                          }
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Field>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                style={{ width: '100%', padding: '12px 32px' }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'inherit' }} />
                ) : (
                  t('auth:confirmCode.submit')
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
