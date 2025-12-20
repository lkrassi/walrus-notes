import React, { useState } from 'react';
import cn from 'shared/lib/cn';
import { Button } from 'shared';
import { useLocalization } from 'widgets/hooks';
import { ValidatedField } from 'features/form/ui/ValidatedField';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useModalContentContext } from 'widgets/ui';

interface ForgotPasswordEmailModalProps {
  onSubmit: (email: string) => Promise<void>;
}

export const ForgotPasswordEmailModal: React.FC<
  ForgotPasswordEmailModalProps
> = ({ onSubmit }) => {
  const { t } = useLocalization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeModal } = useModalContentContext();

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
    <div className={cn('flex', 'flex-col', 'gap-6', 'w-full')}>
      <div className={cn('text-center')}>
        <p
          className={cn(
            'text-sm',
            'text-secondary',
            'dark:text-dark-secondary'
          )}
        >
          {t('auth:forgotPasswordEmail.description') ||
            'Введите адрес электронной почты для восстановления пароля'}
        </p>
      </div>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {formik => (
          <Form className={cn('flex', 'flex-col', 'gap-4')}>
            <ValidatedField
              name='email'
              label={t('auth:login.email')}
              type='email'
              placeholder={t('auth:login.emailPlaceholder')}
              inputMode='email'
              autoComplete='email'
              enterKeyHint='done'
              required
              autoFocus={true}
            />

            <div className={cn('flex', 'gap-3', 'justify-center')}>
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
                  isSubmitting || !formik.values.email.trim()
                    ? 'disabled'
                    : 'submit'
                }
                disabled={isSubmitting || !formik.values.email.trim()}
                className='btn'
              >
                {isSubmitting ? (
                  <div className={cn('flex', 'items-center', 'gap-2')}>
                    <div
                      className={cn(
                        'h-4',
                        'w-4',
                        'animate-spin',
                        'rounded-full',
                        'border-2',
                        'border-white',
                        'border-t-transparent'
                      )}
                    />
                    {t('auth:forgotPasswordEmail.sending') || 'Отправка...'}
                  </div>
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
