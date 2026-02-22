import { type FC } from 'react';

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export const FieldError: FC<FieldErrorProps> = ({ error, className }) => {
  if (!error) return null;

  return (
    <div
      role='alert'
      aria-live='polite'
      className={`text-sm text-red-500 ${className || ''}`}
    >
      {error}
    </div>
  );
};
