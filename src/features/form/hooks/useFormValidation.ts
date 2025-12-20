import { useFormik, type FormikErrors, type FormikHelpers } from 'formik';
import * as yup from 'yup';

interface UseFormValidationOptions<T> {
  validationSchema?: yup.Schema<T> | yup.AnySchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit: (values: T, helpers?: FormikHelpers<T>) => void | Promise<void>;
}

export const useFormValidation = <T extends Record<string, unknown>>(
  initialValues: T,
  options: UseFormValidationOptions<T>
) => {
  const {
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
  } = options;

  const formik = useFormik<T>({
    initialValues,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    onSubmit,
  });

  const validateField = async (fieldName: keyof T) => {
    if (validationSchema) {
      try {
        await validationSchema.validateAt(
          fieldName as string,
          formik.values as T
        );
        formik.setFieldError(fieldName as string, undefined);
      } catch (error: unknown) {
        if (error instanceof yup.ValidationError) {
          formik.setFieldError(fieldName as string, error.message);
        } else {
          formik.setFieldError(fieldName as string, String(error ?? ''));
        }
      }
    }
  };

  const validateAllFields = async () => {
    if (validationSchema) {
      try {
        await validationSchema.validate(formik.values as T, {
          abortEarly: false,
        });
        formik.setErrors({} as FormikErrors<T>);
      } catch (error: unknown) {
        if (error instanceof yup.ValidationError) {
          const errors: Record<string, string> = {};
          error.inner.forEach(err => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });
          formik.setErrors(errors as unknown as FormikErrors<T>);
        }
      }
    }
  };

  const isFieldValid = (fieldName: keyof T): boolean => {
    const error = formik.errors[fieldName as keyof T];
    const touched = formik.touched[fieldName as string];
    return !error && Boolean(touched);
  };

  const getFieldError = (fieldName: keyof T): string | undefined => {
    const error = formik.errors[fieldName as keyof T];
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
