import React from 'react';
import TextField from '@mui/material/TextField';
import type { InputProps } from 'shared/model/inputProps';

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  disabled = false,
  variant = 'default',
  ring = true,
  className = '',
  autoFocus = false,
  maxLength,
  minLength,
  required = false,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: InputProps) => {
  const isError = variant === 'error';

  return (
    <TextField
      fullWidth
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      error={isError}
      className={className}
      autoFocus={autoFocus}
      required={required}
      name={name}
      id={id}
      inputProps={{
        maxLength,
        minLength,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedBy,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused fieldset': {
            borderWidth: ring ? '2px' : '1px',
          },
        },
      }}
    />
  );
};
