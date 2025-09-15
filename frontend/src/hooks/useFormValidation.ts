import { useState, useCallback, useMemo } from 'react';

// Validation rule types
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: T) => string | null;
  dependencies?: string[];
}

export interface FieldValidation {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormValidation {
  [fieldName: string]: FieldValidation;
}

export interface ValidationMessages {
  required?: string;
  minLength?: string;
  maxLength?: string;
  min?: string;
  max?: string;
  pattern?: string;
  email?: string;
  phone?: string;
  url?: string;
}

export interface FormConfig {
  [fieldName: string]: {
    rules: ValidationRule;
    messages?: ValidationMessages;
    initialValue?: any;
  };
}

// Default validation messages
const DEFAULT_MESSAGES: ValidationMessages = {
  required: 'This field is required',
  minLength: 'Must be at least {min} characters',
  maxLength: 'Must be no more than {max} characters',
  min: 'Must be at least {min}',
  max: 'Must be no more than {max}',
  pattern: 'Invalid format',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+\..+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  alphabetic: /^[a-zA-Z]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  mediumPassword: /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{13,19}$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
};

/**
 * Validates a single field value against its rules
 */
export const validateField = (
  value: any,
  rules: ValidationRule,
  messages: ValidationMessages = {},
  allValues?: Record<string, any>
): string | null => {
  const msgs = { ...DEFAULT_MESSAGES, ...messages };

  // Required validation
  if (rules.required && (value === null || value === undefined || value === '')) {
    return msgs.required || DEFAULT_MESSAGES.required!;
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return null;
  }

  const stringValue = String(value);

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return (msgs.minLength || DEFAULT_MESSAGES.minLength!).replace('{min}', String(rules.minLength));
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return (msgs.maxLength || DEFAULT_MESSAGES.maxLength!).replace('{max}', String(rules.maxLength));
  }

  // Numeric validations
  if (rules.min !== undefined) {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue < rules.min) {
      return (msgs.min || DEFAULT_MESSAGES.min!).replace('{min}', String(rules.min));
    }
  }

  if (rules.max !== undefined) {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > rules.max) {
      return (msgs.max || DEFAULT_MESSAGES.max!).replace('{max}', String(rules.max));
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return msgs.pattern || DEFAULT_MESSAGES.pattern!;
  }

  // Email validation
  if (rules.email && !VALIDATION_PATTERNS.email.test(stringValue)) {
    return msgs.email || DEFAULT_MESSAGES.email!;
  }

  // Phone validation
  if (rules.phone && !VALIDATION_PATTERNS.phone.test(stringValue.replace(/\s|-|\(|\)/g, ''))) {
    return msgs.phone || DEFAULT_MESSAGES.phone!;
  }

  // URL validation
  if (rules.url && !VALIDATION_PATTERNS.url.test(stringValue)) {
    return msgs.url || DEFAULT_MESSAGES.url!;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

/**
 * Hook for form validation
 */
export const useFormValidation = (config: FormConfig) => {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    Object.keys(config).forEach(fieldName => {
      initialValues[fieldName] = config[fieldName].initialValue ?? '';
    });
    return initialValues;
  });

  const [validation, setValidation] = useState<FormValidation>(() => {
    const initialValidation: FormValidation = {};
    Object.keys(config).forEach(fieldName => {
      initialValidation[fieldName] = {
        value: config[fieldName].initialValue ?? '',
        error: null,
        touched: false,
        dirty: false,
      };
    });
    return initialValidation;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateSingleField = useCallback((fieldName: string, value: any, touch: boolean = false) => {
    const fieldConfig = config[fieldName];
    if (!fieldConfig) return;

    const error = validateField(value, fieldConfig.rules, fieldConfig.messages, values);
    
    setValidation(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error,
        touched: touch || prev[fieldName].touched,
        dirty: value !== (config[fieldName].initialValue ?? ''),
      },
    }));

    return error;
  }, [config, values]);

  // Set field value and validate
  const setFieldValue = useCallback((fieldName: string, value: any, validate: boolean = true) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    if (validate) {
      validateSingleField(fieldName, value);
    }
  }, [validateSingleField]);

  // Set field touched
  const setFieldTouched = useCallback((fieldName: string, touched: boolean = true) => {
    setValidation(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched,
      },
    }));
  }, []);

  // Set multiple values
  const setValues_ = useCallback((newValues: Record<string, any>, validate: boolean = true) => {
    setValues(prev => ({ ...prev, ...newValues }));
    
    if (validate) {
      Object.keys(newValues).forEach(fieldName => {
        validateSingleField(fieldName, newValues[fieldName]);
      });
    }
  }, [validateSingleField]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newValidation: FormValidation = { ...validation };
    let hasErrors = false;

    Object.keys(config).forEach(fieldName => {
      const value = values[fieldName];
      const error = validateField(value, config[fieldName].rules, config[fieldName].messages, values);
      
      newValidation[fieldName] = {
        ...newValidation[fieldName],
        value,
        error,
        touched: true,
      };

      if (error) hasErrors = true;
    });

    setValidation(newValidation);
    return !hasErrors;
  }, [config, values, validation]);

  // Reset form
  const reset = useCallback(() => {
    const initialValues: Record<string, any> = {};
    const initialValidation: FormValidation = {};
    
    Object.keys(config).forEach(fieldName => {
      const initialValue = config[fieldName].initialValue ?? '';
      initialValues[fieldName] = initialValue;
      initialValidation[fieldName] = {
        value: initialValue,
        error: null,
        touched: false,
        dirty: false,
      };
    });

    setValues(initialValues);
    setValidation(initialValidation);
    setIsSubmitting(false);
  }, [config]);

  // Get field props for easy integration with input components
  const getFieldProps = useCallback((fieldName: string) => {
    const fieldValidation = validation[fieldName];
    return {
      value: values[fieldName] ?? '',
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFieldValue(fieldName, event.target.value);
      },
      onBlur: () => {
        setFieldTouched(fieldName, true);
        validateSingleField(fieldName, values[fieldName], true);
      },
      error: fieldValidation?.touched && !!fieldValidation?.error,
      helperText: fieldValidation?.touched ? fieldValidation?.error : '',
    };
  }, [values, validation, setFieldValue, setFieldTouched, validateSingleField]);

  // Computed values
  const errors = useMemo(() => {
    const errorObj: Record<string, string | null> = {};
    Object.keys(validation).forEach(fieldName => {
      errorObj[fieldName] = validation[fieldName].error;
    });
    return errorObj;
  }, [validation]);

  const hasError = useMemo(() => {
    return Object.values(validation).some(field => field.error !== null);
  }, [validation]);

  const isDirty = useMemo(() => {
    return Object.values(validation).some(field => field.dirty);
  }, [validation]);

  const isValid = useMemo(() => {
    return Object.values(validation).every(field => field.error === null);
  }, [validation]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit: (values: Record<string, any>) => Promise<void> | void) => {
    const isFormValid = validateAll();
    
    if (!isFormValid) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAll, values]);

  return {
    values,
    errors,
    validation,
    hasError,
    isDirty,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    setValues: setValues_,
    validateField: validateSingleField,
    validateAll,
    reset,
    getFieldProps,
    handleSubmit,
  };
};

/**
 * Hook for field-level validation
 */
export const useFieldValidation = (
  initialValue: any = '',
  rules: ValidationRule,
  messages?: ValidationMessages
) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);

  const validate = useCallback((val: any = value) => {
    const validationError = validateField(val, rules, messages);
    setError(validationError);
    return validationError === null;
  }, [value, rules, messages]);

  const handleChange = useCallback((newValue: any) => {
    setValue(newValue);
    setDirty(newValue !== initialValue);
    if (touched) {
      validate(newValue);
    }
  }, [initialValue, touched, validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
    setDirty(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    dirty,
    isValid: error === null,
    setValue: handleChange,
    setTouched,
    validate,
    reset,
    handleChange,
    handleBlur,
    fieldProps: {
      value,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleChange(event.target.value);
      },
      onBlur: handleBlur,
      error: touched && !!error,
      helperText: touched ? error : '',
    },
  };
};