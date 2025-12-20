export type InputVariant = 'default' | 'error';

export type InputProps = {
  variant?: InputVariant;
  className?: string;
  ring?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;
