import React from 'react';

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className }) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`text-red-500 text-sm ${className || ''}`}
    >
      {error}
    </div>
  );
};
