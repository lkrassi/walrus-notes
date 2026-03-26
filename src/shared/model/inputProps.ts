import type { InputHTMLAttributes } from 'react';

export type InputVariant = 'default' | 'error';

export type InputProps = {
  variant?: InputVariant;
  className?: string;
  ring?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;
