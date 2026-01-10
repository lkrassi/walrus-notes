import React, { useState, useRef, useEffect } from 'react';
import { useConfirmCodeMutation } from 'app/store/api';
import { useLocalization } from 'widgets/hooks';
import { useNotifications } from 'widgets/hooks';
import { Button } from 'shared';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface ConfirmCodeModalProps {
  email: string;
  onSuccess: () => void;
}

export const ConfirmCodeModal: React.FC<ConfirmCodeModalProps> = ({
  email,
  onSuccess,
}) => {
  const { t } = useLocalization();
  const { showError } = useNotifications();
  const [confirmCode] = useConfirmCodeMutation();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
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

  const handleSubmit = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      return;
    }

    setIsLoading(true);

    try {
      await confirmCode({
        email,
        code: codeString,
      }).unwrap();

      onSuccess();
    } catch (_e) {
      // show localized error for invalid confirmation code
      showError(t('auth:confirmCode.error.invalid') || 'Неверный код');
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
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {t('auth:confirmCode.description') ||
            'Код подтверждения отправлен на'}
          <br />
          <Typography
            component='span'
            sx={{ fontWeight: 600, color: 'text.primary' }}
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
          maxWidth: '320px',
        }}
      >
        {code.map((digit, index) => (
          <TextField
            key={index}
            inputRef={el => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputProps={{
              inputMode: 'numeric',
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '1.125rem',
                fontWeight: 600,
                padding: '12px 0',
              },
            }}
            value={digit}
            autoFocus={index === 0}
            onChange={e => handleInputChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            sx={{
              width: '48px',
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
                '& fieldset': {
                  borderWidth: digit ? 2 : 1,
                  borderColor: digit ? 'primary.main' : undefined,
                },
              },
            }}
          />
        ))}
      </Box>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || code.join('').length !== 6}
        variant={
          isLoading || code.join('').length !== 6 ? 'disabled' : 'submit'
        }
        sx={{ width: '100%', px: 4, py: 1.5 }}
      >
        {isLoading
          ? t('auth:confirmCode.loading')
          : t('auth:confirmCode.submit')}
      </Button>
    </Box>
  );
};
