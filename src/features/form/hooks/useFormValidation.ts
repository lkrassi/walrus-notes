import { useFormik } from 'formik';
import * as yup from 'yup';

interface UseFormValidationOptions {
  validationSchema?: yup.ObjectSchema<any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit: (values: any) => void | Promise<void>;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  options: UseFormValidationOptions
) => {
  const {
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
  } = options;

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    onSubmit,
  });

  // Расширенная логика валидации
  const validateField = async (fieldName: keyof T) => {
    if (validationSchema) {
      try {
        await validationSchema.validateAt(fieldName as string, formik.values);
        formik.setFieldError(fieldName as string, undefined);
      } catch (error: any) {
        formik.setFieldError(fieldName as string, error.message);
      }
    }
  };

  const validateAllFields = async () => {
    if (validationSchema) {
      try {
        await validationSchema.validate(formik.values, { abortEarly: false });
        formik.setErrors({});
      } catch (error: any) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err: any) => {
          errors[err.path] = err.message;
        });
        formik.setErrors(errors as any);
      }
    }
  };

  const isFieldValid = (fieldName: keyof T): boolean => {
    const error = formik.errors[fieldName as string];
    const touched = formik.touched[fieldName as string];
    return !error && Boolean(touched);
  };

  const getFieldError = (fieldName: keyof T): string | undefined => {
    const error = formik.errors[fieldName as string];
    return typeof error === 'string' ? error : undefined;
  };

  const isFormValid = (): boolean => {
    return Object.keys(formik.errors).length === 0 && formik.isValid;
  };

  return {
    ...formik,
    validateField,
    validateAllFields,
    isFieldValid,
    getFieldError,
    isFormValid,
  };
};
