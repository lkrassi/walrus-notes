import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import { useAppDispatch, useNotifications } from 'widgets';

import { login } from 'features/auth/api';
import { usePasswordVisibility } from 'features/auth/hooks';
import { PasswordVisibilityToggle } from 'features/auth/ui/components/PasswordVisibilityToggle';
import { Input } from 'shared';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useMobileForm } from 'widgets/hooks/useMobileForm';

type LoginProps = {
  onSwitchToRegister?: () => void;
};

export const Login: React.FC<LoginProps> = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const passwordVisibility = usePasswordVisibility();
  const { t } = useLocalization();

  const { formRef } = useMobileForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await login(formData, dispatch);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', '3b3c093a-8a0a-4427-8a3e-947462697f7e');
      showSuccess(t('auth:login.success'));
      navigate('/dashboard');
    } catch (error) {
      showError(t('auth:login.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className='border-border dark:border-dark-border bg-gradient rounded-2xl border p-8 shadow-sm backdrop-blur-sm'
    >
      <h2 className='text-text dark:text-dark-text mb-8 text-center text-3xl font-light tracking-tight'>
        {t('auth:login.title')}
      </h2>

      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <label
            htmlFor='email'
            className='text-secondary dark:text-dark-secondary text-sm font-medium'
          >
            {t('auth:login.email')}
          </label>
          <Input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder={t('auth:login.emailPlaceholder')}
            variant='default'
            className='w-full rounded-xl border-2 px-4 py-3'
            inputMode='email'
            autoComplete='email'
            enterKeyHint='next'
            required
          />
        </div>

        <div className='flex flex-col gap-3'>
          <label
            htmlFor='password'
            className='text-secondary dark:text-dark-secondary text-sm font-medium'
          >
            {t('auth:login.password')}
          </label>
          <div className='relative'>
            <Input
              type={passwordVisibility.isVisible ? 'text' : 'password'}
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth:login.passwordPlaceholder')}
              variant='default'
              className='w-full rounded-xl border-2 px-4 py-3 pr-12'
              autoComplete='current-password'
              enterKeyHint='done'
              required
            />
            <div className='absolute top-1/2 right-3 -translate-y-2/3 transform'>
              <PasswordVisibilityToggle
                isVisible={passwordVisibility.isVisible}
                onToggle={passwordVisibility.toggleVisibility}
              />
            </div>
          </div>
        </div>

        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full px-8 py-3'
        >
          {isSubmitting ? (
            <div className='flex items-center justify-center'>
              <div className='mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
              {t('auth:login.submitting')}
            </div>
          ) : (
            t('auth:login.submit')
          )}
        </Button>
      </div>
    </form>
  );
};
