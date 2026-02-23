import { memo, type FC, type ReactNode } from 'react';

export const SafeLink: FC<{
  href?: string;
  title?: string;
  children?: ReactNode;
}> = memo(function SafeLink({ href = '', title, children }) {
  if (
    !href.startsWith('http://') &&
    !href.startsWith('https://') &&
    !href.startsWith('mailto:') &&
    !href.startsWith('#')
  ) {
    return <span>{children}</span>;
  }
  return (
    <a
      href={href}
      title={title}
      rel='noopener noreferrer'
      target={href.startsWith('http') ? '_blank' : undefined}
    >
      {children}
    </a>
  );
});
