import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import { useNotifications } from 'widgets';

import { login } from 'features/auth/api';
import { usePasswordVisibility } from 'features/auth/hooks';
import { PasswordVisibilityToggle } from 'features/auth/ui/components/PasswordVisibilityToggle';

import { useLocalization } from 'widgets/hooks/useLocalization';

type LoginProps = {
  onSwitchToRegister?: () => void;
};

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const navigate = useNavigate();
  const passwordVisibility = usePasswordVisibility();

  const { t } = useLocalization();

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
      const response = await login(formData);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
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
      onSubmit={handleSubmit}
      className='rounded-2xl shadow-sm border border-border dark:border-dark-border p-8 backdrop-blur-sm bg-gradient'
    >
      <h2 className='text-3xl font-light text-text dark:text-dark-text text-center mb-8 tracking-tight'>
        {t('auth:login.title')}
      </h2>

      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <label
            htmlFor='email'
            className='text-sm font-medium text-secondary dark:text-dark-secondary'
          >
            {t('auth:login.email')}
          </label>
          <input
            type='email'
            id='email'
            value={formData.email}
            onChange={handleChange}
            className='px-4 py-3 border-2 rounded-xl text-text dark:text-dark-text focus:border-border-focus dark:focus:border-dark-border-focus transition-all duration-300 placeholder:text-input-placeholder dark:placeholder:text-dark-input-placeholder'
            placeholder={t('auth:login.emailPlaceholder')}
          />
        </div>

        <div className='flex flex-col gap-3'>
          <label
            htmlFor='password'
            className='text-sm font-medium text-secondary dark:text-dark-secondary'
          >
            {t('auth:login.password')}
          </label>
          <div className='relative'>
            <input
              type={passwordVisibility.isVisible ? 'text' : 'password'}
              id='password'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 border-2 rounded-xl text-text dark:text-dark-text focus:border-border-focus dark:focus:border-dark-border-focus transition-all duration-300 placeholder:text-input-placeholder dark:placeholder:text-dark-input-placeholder pr-12'
              placeholder={t('auth:login.passwordPlaceholder')}
            />
            <div className='absolute right-3 top-1/2 transform -translate-y-2/3'>
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
          className='bg-btn-bg hover:bg-btn-hover w-full py-3 px-8'
        >
          {isSubmitting ? (
            <div className='flex items-center justify-center'>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
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
