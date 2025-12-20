export type ButtonVariant = 'default' | 'disabled' | 'escape' | 'submit';

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'default' | 'escape' | 'submit' | 'disabled';
  className?: string;
  to?: string;
  title?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
