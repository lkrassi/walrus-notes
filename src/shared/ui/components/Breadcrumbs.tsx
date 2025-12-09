import React from 'react';
import { Link } from 'react-router-dom';
import cn from 'shared/lib/cn';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  to?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const sanitizeLabel = (label: string) => {
  if (!label) return '';
  // If translation returned a key-like string (e.g. "title/Профиль"), try to clean it
  const parts = label.split('/');
  let s = parts[parts.length - 1];
  s = s.replace(/^title[:\\/]+/i, '');
  return s;
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label='breadcrumb'
      className={cn('mb-4', 'flex', 'justify-center', className)}
    >
      <ol
        className={cn(
          'flex',
          'items-center',
          'gap-2',
          'text-lg',
          'text-secondary'
        )}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const label = sanitizeLabel(item.label);

          return (
            <li key={idx} className={cn('flex', 'items-center')}>
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className={cn('text-primary', 'hover:underline', 'text-lg')}
                >
                  {label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast ? 'text-text text-lg font-medium' : 'text-lg'
                  )}
                >
                  {label}
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  className={cn('mx-2', 'text-secondary')}
                  size={16}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
