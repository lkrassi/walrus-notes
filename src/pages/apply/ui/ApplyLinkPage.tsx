import { useApplyLinkMutation } from 'app/store';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';

export const ApplyLinkPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [applyLink] = useApplyLinkMutation();
  const { t } = useLocalization();
  const linkId = searchParams.get('linkId');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!linkId) {
      setStatus('error');
      setErrorCode('invalid');
      return;
    }

    const applyLinkFn = async () => {
      try {
        const result = await applyLink({ linkId }).unwrap();
        setStatus('success');
        setTimeout(() => {
          if (result.kind === 'PERMISSIONS_KIND_LAYOUT') {
            navigate(`/dashboard/${result.targetId}`);
          } else if (result.kind === 'PERMISSIONS_KIND_NOTE') {
            navigate(`/dashboard`);
          } else {
            navigate('/');
          }
        }, 2000);
      } catch (error) {
        const errorCode =
          error instanceof Error && error.message
            ? error.message
            : 'unknown_error';
        setStatus('error');
        setErrorCode(errorCode);
      }
    };

    applyLinkFn();
  }, [linkId, applyLink, navigate]);

  const getErrorMessage = () => {
    if (errorCode === 'invalid') {
      return t('apply.error.invalid') || 'Invalid link';
    } else if (errorCode === 'already_exists') {
      return t('apply.error.already_exists') || 'Link already used';
    }
    return t('apply.error.generic') || 'Error applying link';
  };

  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center',
        'dark:bg-dark-bg bg-white'
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg p-6 shadow-lg',
          'dark:bg-dark-bg bg-white',
          'border-border dark:border-dark-border border',
          'mx-4 w-full max-w-md'
        )}
      >
        {status === 'loading' && (
          <>
            <Loader
              className={cn('text-primary mb-4 h-12 w-12 animate-spin')}
            />
            <p
              className={cn(
                'text-sm',
                'text-text dark:text-dark-text',
                'text-center'
              )}
            >
              {t('apply.loading') || 'Processing link...'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className={cn('mb-4 h-12 w-12 text-green-500')} />
            <p
              className={cn(
                'mb-2 text-lg font-bold',
                'text-text dark:text-dark-text',
                'text-center'
              )}
            >
              {t('apply.success') || 'Access granted!'}
            </p>
            <p
              className={cn(
                'text-xs',
                'text-secondary dark:text-dark-secondary',
                'text-center'
              )}
            >
              {t('apply.redirecting') || 'Redirecting...'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className={cn('mb-4 h-12 w-12 text-red-500')} />
            <p
              className={cn(
                'mb-2 text-lg font-bold',
                'text-text dark:text-dark-text',
                'text-center'
              )}
            >
              {t('apply.error.title') || 'Error'}
            </p>
            <p
              className={cn(
                'mb-4 text-xs',
                'text-red-600 dark:text-red-400',
                'text-center'
              )}
            >
              {getErrorMessage()}
            </p>
            <button
              onClick={() => navigate('/')}
              className={cn(
                'rounded-lg px-4 py-2 font-medium transition-colors',
                'bg-primary hover:bg-primary/90 text-white'
              )}
            >
              {t('apply.goToDashboard') || 'Go Home'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
