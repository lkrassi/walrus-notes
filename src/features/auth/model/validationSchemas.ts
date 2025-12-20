import * as yup from 'yup';

declare module 'yup' {
  interface StringSchema {
    passwordStrength(message: string): StringSchema;
    noCommonPasswords(message: string): StringSchema;
  }
}

yup.addMethod(yup.string, 'passwordStrength', function (message) {
  return this.test('password-strength', message, function (value) {
    if (!value) return true;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
    const isLongEnough = value.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar &&
      isLongEnough
    );
  });
});

yup.addMethod(yup.string, 'noCommonPasswords', function (message) {
  return this.test('no-common-passwords', message, function (value) {
    if (!value) return true;

    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      '1234567890',
      'iloveyou',
      'princess',
      'rockyou',
      '1234567',
      '12345678',
      'password1',
      '123123',
      'football',
      'baseball',
      'welcome1',
      'admin123',
      'qwerty123',
    ];

    return !commonPasswords.includes(value.toLowerCase());
  });
});

const createValidationSchema = (t: (key: string) => string) => ({
  login: yup.object().shape({
    email: yup
      .string()
      .email(t('auth:validation.emailInvalid'))
      .required(t('auth:validation.emailRequired')),
    password: yup.string().required(t('auth:validation.passwordRequired')),
  }),

  register: yup.object().shape({
    email: yup
      .string()
      .email(t('auth:validation.emailInvalid'))
      .required(t('auth:validation.emailRequired')),
    username: yup
      .string()
      .min(3, t('auth:validation.usernameMinLength'))
      .max(20, t('auth:validation.usernameMaxLength'))
      .matches(/^[a-zA-Z0-9_]+$/, t('auth:validation.usernamePattern'))
      .required(t('auth:validation.usernameRequired')),
    password: yup
      .string()
      .passwordStrength(t('auth:validation.passwordStrength'))
      .noCommonPasswords(t('auth:validation.passwordCommon'))
      .required(t('auth:validation.passwordRequired')),
  }),
});

export const createAuthValidationSchemas = (t: (key: string) => string) => {
  const schemas = createValidationSchema(t);
  return {
    loginValidationSchema: schemas.login,
    registerValidationSchema: schemas.register,
  };
};

export const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('auth:validation.emailInvalid')
    .required('auth:validation.emailRequired'),
  password: yup
    .string()
    .min(6, 'auth:validation.passwordMinLength')
    .required('auth:validation.passwordRequired'),
});

export const registerValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('auth:validation.emailInvalid')
    .required('auth:validation.emailRequired'),
  username: yup
    .string()
    .min(3, 'auth:validation.usernameMinLength')
    .required('auth:validation.usernameRequired'),
  password: yup
    .string()
    .min(6, 'auth:validation.passwordMinLength')
    .required('auth:validation.passwordRequired'),
});
