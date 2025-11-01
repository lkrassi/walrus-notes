import { ChevronRight, Home } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';

export const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className='flex items-center space-x-2 text-sm'>
      <Link
        to='/dashboard'
        className='text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary flex items-center transition-colors'
      >
        <Home className='h-4 w-4' />
      </Link>

      {breadcrumbs.map((crumb) => (
        <div key={crumb.path} className='flex items-center'>
          <ChevronRight className='text-secondary dark:text-dark-secondary mx-2 h-4 w-4' />

          {crumb.isLast ? (
            <span className='text-text dark:text-dark-text font-medium'>
              {crumb.name}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className='text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary transition-colors'
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
