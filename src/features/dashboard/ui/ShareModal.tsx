import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import { Tooltip } from '@/shared/ui';
import { Form, Formik } from 'formik';
import { Check, Copy, LockKeyhole } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  shareModalValidationSchema,
  useShareModalState,
} from '../model/useShareModalState';

interface ShareModalProps {
  targetId: string;
}

const permissionBlockStyleByRight = {
  canRead: 'bg-sky-500/8 border-sky-500/25 text-sky-700 dark:text-sky-300',
  canWrite:
    'bg-amber-500/8 border-amber-500/25 text-amber-700 dark:text-amber-300',
  canEdit:
    'bg-emerald-500/8 border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
} as const;

const PermissionOption = ({
  field,
  label,
  title,
  checked,
  locked = false,
  onToggle,
}: {
  field: keyof typeof permissionBlockStyleByRight;
  label: string;
  title: string;
  checked: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) => {
  const block = (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors',
        'border-border dark:border-dark-border dark:bg-dark-bg/60 bg-white/80',
        checked
          ? permissionBlockStyleByRight[field]
          : 'opacity-45 grayscale-[0.15]'
      )}
    >
      <span className='min-w-0 flex-1 truncate font-medium tracking-wide uppercase'>
        {label}
      </span>

      {locked ? (
        <div
          className={cn(
            'border-border dark:border-dark-border text-muted-foreground flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
            'bg-muted/60 dark:bg-dark-bg/40'
          )}
          aria-hidden='true'
        >
          <LockKeyhole className='h-2.5 w-2.5' />
        </div>
      ) : (
        <div
          className={cn(
            'border-border dark:border-dark-border flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
            checked
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-transparent'
          )}
        >
          {checked ? <Check className='h-3 w-3' /> : null}
        </div>
      )}
    </div>
  );

  if (!onToggle || locked) {
    return (
      <Tooltip title={title}>
        <div className='w-full'>{block}</div>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={title}>
      <button
        type='button'
        onClick={onToggle}
        className='block w-full text-left'
      >
        {block}
      </button>
    </Tooltip>
  );
};

export const ShareModal = memo(function ShareModal({
  targetId,
}: ShareModalProps) {
  const {
    generatedLink,
    copied,
    initialValues,
    handleSubmit,
    handleCopy,
    handleClose,
  } = useShareModalState(targetId);
  const { t } = useTranslation();

  if (generatedLink) {
    return (
      <form className={cn('space-y-6', 'p-6')}>
        <div className={cn('text-center')}>
          <p className={cn('muted-text', 'mb-4', 'text-sm')}>
            {t('share:modal.success.description')}
          </p>

          <div
            className={cn(
              'mb-4 overflow-auto rounded-lg p-3',
              'border-border border',
              'bg-surface-2'
            )}
          >
            <p className={cn('font-mono text-xs break-all', 'text-foreground')}>
              {generatedLink.fullUrl}
            </p>
          </div>
        </div>

        <div className={cn('flex justify-center gap-3')}>
          <Button
            type='button'
            onClick={handleCopy}
            variant='submit'
            className={cn('btn', 'gap-2', 'flex items-center')}
          >
            {copied ? (
              <>
                <Check className={cn('h-4 w-4')} />
                {t('share:modal.success.copied')}
              </>
            ) : (
              <>
                <Copy className={cn('h-4 w-4')} />
                {t('share:modal.success.copy')}
              </>
            )}
          </Button>
          <Button
            type='button'
            onClick={handleClose}
            variant='escape'
            className={cn('btn')}
          >
            {t('share:modal.cancel')}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={shareModalValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form className={cn('space-y-6', 'p-6')}>
          <div>
            <div className='flex flex-col gap-y-5'>
              <PermissionOption
                field='canRead'
                label={t('share:permissionsDashboard.flagsLabel.read')}
                title={t('share:permissionsDashboard.rightsDescriptions.read')}
                checked={values.canRead}
                locked={values.canWrite || values.canEdit}
                onToggle={
                  values.canWrite || values.canEdit
                    ? undefined
                    : () => setFieldValue('canRead', !values.canRead)
                }
              />

              <PermissionOption
                field='canWrite'
                label={t('share:permissionsDashboard.flagsLabel.write')}
                title={t('share:permissionsDashboard.rightsDescriptions.write')}
                checked={values.canWrite}
                onToggle={() => {
                  const nextValue = !values.canWrite;
                  setFieldValue('canWrite', nextValue);
                  if (nextValue) {
                    setFieldValue('canRead', true);
                  }
                }}
              />

              <PermissionOption
                field='canEdit'
                label={t('share:permissionsDashboard.flagsLabel.edit')}
                title={t('share:permissionsDashboard.rightsDescriptions.edit')}
                checked={values.canEdit}
                onToggle={() => {
                  const nextValue = !values.canEdit;
                  setFieldValue('canEdit', nextValue);
                  if (nextValue) {
                    setFieldValue('canRead', true);
                  }
                }}
              />
            </div>
            <div className={cn('mt-5')}>
              <label
                className={cn(
                  'mb-3 block text-sm font-medium',
                  'text-text dark:text-dark-text'
                )}
              >
                {t('share:modal.expiration.label')}
              </label>

              <div className={cn('space-y-3')}>
                <div className='flex max-sm:flex-col max-sm:gap-y-3 sm:gap-x-5'>
                  <label
                    className={cn('flex cursor-pointer items-center gap-3')}
                  >
                    <input
                      type='radio'
                      name='expirationOption'
                      value='5'
                      checked={values.expirationOption === '5'}
                      onChange={e =>
                        setFieldValue('expirationOption', e.target.value)
                      }
                      className={cn(
                        'border-border text-primary accent-primary h-4 w-4 cursor-pointer',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
                      )}
                    />
                    <span
                      className={cn('text-sm', 'text-text dark:text-dark-text')}
                    >
                      {t('share:modal.expiration.options.fiveMinutes')}
                    </span>
                  </label>

                  <label
                    className={cn('flex cursor-pointer items-center gap-3')}
                  >
                    <input
                      type='radio'
                      name='expirationOption'
                      value='30'
                      checked={values.expirationOption === '30'}
                      onChange={e =>
                        setFieldValue('expirationOption', e.target.value)
                      }
                      className={cn(
                        'border-border text-primary accent-primary h-4 w-4 cursor-pointer',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
                      )}
                    />
                    <span
                      className={cn('text-sm', 'text-text dark:text-dark-text')}
                    >
                      {t('share:modal.expiration.options.thirtyMinutes')}
                    </span>
                  </label>

                  <label
                    className={cn('flex cursor-pointer items-center gap-3')}
                  >
                    <input
                      type='radio'
                      name='expirationOption'
                      value='60'
                      checked={values.expirationOption === '60'}
                      onChange={e =>
                        setFieldValue('expirationOption', e.target.value)
                      }
                      className={cn(
                        'border-border text-primary accent-primary h-4 w-4 cursor-pointer',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
                      )}
                    />
                    <span
                      className={cn('text-sm', 'text-text dark:text-dark-text')}
                    >
                      {t('share:modal.expiration.options.oneHour')}
                    </span>
                  </label>

                  <label
                    className={cn('flex cursor-pointer items-center gap-3')}
                  >
                    <input
                      type='radio'
                      name='expirationOption'
                      value='custom'
                      checked={values.expirationOption === 'custom'}
                      onChange={e =>
                        setFieldValue('expirationOption', e.target.value)
                      }
                      className={cn(
                        'border-border text-primary accent-primary h-4 w-4 cursor-pointer',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
                      )}
                    />
                    <span
                      className={cn('text-sm', 'text-text dark:text-dark-text')}
                    >
                      {t('share:modal.expiration.options.custom')}
                    </span>
                  </label>
                </div>

                {values.expirationOption === 'custom' && (
                  <div className={cn('ml-7')}>
                    <input
                      type='number'
                      value={values.customMinutes}
                      onChange={e =>
                        setFieldValue('customMinutes', e.target.value)
                      }
                      placeholder={t(
                        'share:modal.expiration.customPlaceholder'
                      )}
                      className={cn(
                        'form-input w-full',
                        touched.customMinutes && errors.customMinutes
                          ? 'border-red-500'
                          : ''
                      )}
                      min='5'
                      max='43200'
                    />
                    {touched.customMinutes && errors.customMinutes && (
                      <p className={cn('mt-1 text-xs text-red-500')}>
                        {errors.customMinutes}
                      </p>
                    )}
                  </div>
                )}

                {errors.expirationOption && (
                  <p className={cn('text-xs text-red-500')}>
                    {errors.expirationOption}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={cn('flex justify-center gap-3')}>
            <Button
              type='button'
              onClick={handleClose}
              variant='escape'
              className={cn('btn')}
              disabled={isSubmitting}
            >
              {t('share:modal.cancel')}
            </Button>
            <Button
              type='submit'
              variant={
                isSubmitting ||
                (!values.canRead && !values.canWrite && !values.canEdit)
                  ? 'disabled'
                  : 'submit'
              }
              className={cn('btn')}
              disabled={
                isSubmitting ||
                (!values.canRead && !values.canWrite && !values.canEdit)
              }
            >
              {isSubmitting
                ? t('share:modal.submitting')
                : t('share:modal.submit')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
});
