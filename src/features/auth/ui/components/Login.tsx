import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import { useNotifications } from 'widgets';
import { login } from '../../api/login';
import { usePasswordVisibility } from '../../hooks/usePasswordVisibility';
import { PasswordVisibilityToggle } from './PasswordVisibilityToggle';

type LoginProps = {
  onSwitchToRegister?: () => void;
}

export const Login: React.FC<LoginProps> = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const navigate = useNavigate();
  const passwordVisibility = usePasswordVisibility();

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
      showSuccess('Вход выполнен успешно!');
      navigate('/dashboard');
    } catch (error) {
      showError('Неверный email или пароль');
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
        Вход в аккаунт
      </h2>

      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <label
            htmlFor='email'
            className='text-sm font-medium text-secondary dark:text-dark-secondary'
          >
            E-mail
          </label>
          <input
            type='email'
            id='email'
            value={formData.email}
            onChange={handleChange}
            className='px-4 py-3 border-2 rounded-xl text-text dark:text-dark-text focus:border-border-focus dark:focus:border-dark-border-focus transition-all duration-300 placeholder:text-input-placeholder dark:placeholder:text-dark-input-placeholder'
            placeholder='your@email.com'
          />
        </div>

        <div className='flex flex-col gap-3'>
          <label
            htmlFor='password'
            className='text-sm font-medium text-secondary dark:text-dark-secondary'
          >
            Пароль
          </label>
          <div className='relative'>
            <input
              type={passwordVisibility.isVisible ? 'text' : 'password'}
              id='password'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 border-2 rounded-xl text-text dark:text-dark-text focus:border-border-focus dark:focus:border-dark-border-focus transition-all duration-300 placeholder:text-input-placeholder dark:placeholder:text-dark-input-placeholder pr-12'
              placeholder='Введите пароль'
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
          className='w-full py-3 px-8'
        >
          {isSubmitting ? (
            <div className='flex items-center justify-center'>Вход...</div>
          ) : (
            'Войти'
          )}
        </Button>
      </div>
    </form>
  );
};
