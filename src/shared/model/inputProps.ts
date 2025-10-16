export type InputVariant = 'default' | 'error';

export type InputProps = {
  variant?: InputVariant;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;
