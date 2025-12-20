import cn from 'shared/lib/cn';
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
  const getVariantClasses = () => {
    const baseClasses = `
      px-3
      py-2
      text-base
      border
      rounded-md
      focus:outline-none
      disabled:opacity-50
      disabled:cursor-not-allowed
    `;

    const ringClasses = ring ? 'focus:ring-2' : 'focus:ring-0';

    let colorClasses = '';

    switch (variant) {
      case 'default':
        colorClasses = `
          text-text dark:text-dark-text
          bg-white dark:bg-dark-bg
          border-border dark:border-dark-border
          placeholder-secondary dark:placeholder-dark-secondary
          ${ring ? 'focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary' : ''}
        `;
        break;
      case 'error':
        colorClasses = `
          text-text dark:text-dark-text
          bg-white dark:bg-dark-bg
          border-red-500 dark:border-red-400
          placeholder-red-400 dark:placeholder-red-300
          ${ring ? 'focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400' : ''}
        `;
        break;
      default:
        colorClasses = `
          text-text dark:text-dark-text
          bg-white dark:bg-dark-bg
          border-border dark:border-dark-border
          placeholder-secondary dark:placeholder-dark-secondary
          ${ring ? 'focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary' : ''}
        `;
    }

    return cn(baseClasses, ringClasses, colorClasses);
  };

  const variantClasses = getVariantClasses();

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(variantClasses, className)}
      autoFocus={autoFocus}
      maxLength={maxLength}
      minLength={minLength}
      required={required}
      name={name}
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    />
  );
};
