import { Button, Input } from '@/shared';
import { useModalContentContext } from '@/shared/lib/react';
import type { FieldProps } from 'formik';
import { Field, Form, Formik } from 'formik';
import { type FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

interface ForgotPasswordEmailModalProps {
  onSubmit: (email: string) => Promise<void>;
}

export const ForgotPasswordEmailModal: FC<ForgotPasswordEmailModalProps> = ({
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeModal } = useModalContentContext();
  const emailFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      emailFieldRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('auth:validation.emailInvalid'))
      .required(t('auth:validation.emailRequired')),
  });

  const handleSubmit = async (values: { email: string }) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex w-full flex-col gap-3 p-6'>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        validateOnMount={false}
      >
        {({ isValid, dirty }) => (
          <Form className='space-y-6'>
            <Field name='email'>
              {({ field, meta }: FieldProps<string>) => (
                <div className='space-y-1'>
                  <label className='tw-label'>{t('auth:login.email')}</label>
                  <Input
                    {...field}
                    ref={emailFieldRef}
                    type='email'
                    placeholder={t('auth:login.emailPlaceholder')}
                    required
                    disabled={isSubmitting}
                    autoComplete='email'
                    className='form-input'
                    aria-invalid={meta.touched && Boolean(meta.error)}
                  />
                  <p className='min-h-5 text-xs text-red-500'>
                    {meta.touched && meta.error ? meta.error : ' '}
                  </p>
                </div>
              )}
            </Field>

            <div className='mt-1 flex justify-center gap-3'>
              <Button
                type='button'
                onClick={closeModal}
                variant='escape'
                disabled={isSubmitting}
                className='btn'
              >
                {t('common:buttons.cancel') || 'Отмена'}
              </Button>
              <Button
                type='submit'
                variant={
                  isSubmitting || !isValid || !dirty ? 'disabled' : 'submit'
                }
                disabled={isSubmitting || !isValid || !dirty}
                className='btn'
              >
                {isSubmitting ? (
                  <span className='inline-flex items-center gap-1'>
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
                    {t('auth:forgotPasswordEmail.sending') || 'Отправка...'}
                  </span>
                ) : (
                  t('auth:forgotPasswordEmail.submit') || 'Отправить код'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
