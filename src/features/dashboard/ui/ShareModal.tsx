import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import { Form, Formik } from 'formik';
import { Check, Copy } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  shareModalValidationSchema,
  useShareModalState,
} from '../model/useShareModalState';

interface ShareModalProps {
  targetId: string;
  kind: 'LAYOUT' | 'NOTE';
}

export const ShareModal = memo(function ShareModal({
  targetId,
  kind,
}: ShareModalProps) {
  const {
    generatedLink,
    copied,
    modalTitle,
    initialValues,
    handleSubmit,
    handleCopy,
    handleClose,
  } = useShareModalState(targetId, kind);
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
          <h2 className={cn('mb-6 text-xl font-bold', 'text-foreground')}>
            {modalTitle}
          </h2>

          <div>
            <label
              className={cn(
                'mb-3 block text-sm font-medium',
                'text-foreground'
              )}
            >
              {t('share:modal.permissions.label')}
            </label>
            <div className={cn('space-y-3')}>
              <label className={cn('flex cursor-pointer items-center gap-3')}>
                <input
                  type='checkbox'
                  checked={values.canRead}
                  onChange={e => setFieldValue('canRead', e.target.checked)}
                  disabled={values.canWrite || values.canEdit}
                  className={cn(
                    'border-border text-primary accent-primary h-4 w-4 cursor-pointer rounded',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
                  )}
                />
                <span className={cn('text-sm', 'text-foreground')}>
                  {t('share:modal.permissions.read')}
                </span>
              </label>

              <label className={cn('flex cursor-pointer items-center gap-3')}>
                <input
                  type='checkbox'
                  checked={values.canWrite}
                  onChange={e => {
                    setFieldValue('canWrite', e.target.checked);
                    if (e.target.checked) {
                      setFieldValue('canRead', true);
                    }
                  }}
                  className={cn(
                    'border-border text-primary accent-primary h-4 w-4 cursor-pointer rounded',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
                  )}
                />
                <span className={cn('text-sm', 'text-foreground')}>
                  {t('share:modal.permissions.write')}
                </span>
              </label>

              <label className={cn('flex cursor-pointer items-center gap-3')}>
                <input
                  type='checkbox'
                  checked={values.canEdit}
                  onChange={e => {
                    setFieldValue('canEdit', e.target.checked);
                    if (e.target.checked) {
                      setFieldValue('canRead', true);
                    }
                  }}
                  className={cn(
                    'border-border text-primary accent-primary h-4 w-4 cursor-pointer rounded',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
                  )}
                />
                <span className={cn('text-sm', 'text-foreground')}>
                  {t('share:modal.permissions.edit')}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label
              className={cn(
                'mb-3 block text-sm font-medium',
                'text-foreground'
              )}
            >
              {t('share:modal.expiration.label')}
            </label>

            <div className={cn('space-y-3')}>
              <div className='flex gap-x-5'>
                <label className={cn('flex cursor-pointer items-center gap-3')}>
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
                  <span className={cn('text-sm', 'text-foreground')}>
                    {t('share:modal.expiration.options.fiveMinutes')}
                  </span>
                </label>

                <label className={cn('flex cursor-pointer items-center gap-3')}>
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
                  <span className={cn('text-sm', 'text-foreground')}>
                    {t('share:modal.expiration.options.thirtyMinutes')}
                  </span>
                </label>

                <label className={cn('flex cursor-pointer items-center gap-3')}>
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
                  <span className={cn('text-sm', 'text-foreground')}>
                    {t('share:modal.expiration.options.oneHour')}
                  </span>
                </label>

                <label className={cn('flex cursor-pointer items-center gap-3')}>
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
                  <span className={cn('text-sm', 'text-foreground')}>
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
                    placeholder={t('share:modal.expiration.customPlaceholder')}
                    className={cn(
                      'form-input w-full rounded-md',
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
