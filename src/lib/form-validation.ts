export type ValidationError = {
  [key: string]: string;
};

export const validators = {
  email: (value: string): string | null => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  password: (value: string, minLength: number = 8): string | null => {
    if (!value) return 'Password is required';
    if (value.length < minLength) return `Password must be at least ${minLength} characters`;
    return null;
  },

  passwordStrength: (value: string): string | null => {
    if (!value) return 'Password is required';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumber) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    return null;
  },

  requiredString: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value && value.length < min) return `${fieldName} must be at least ${min} characters`;
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value && value.length > max) return `${fieldName} cannot exceed ${max} characters`;
    return null;
  },

  number: (value: string, fieldName: string): string | null => {
    if (value && isNaN(Number(value))) return `${fieldName} must be a valid number`;
    return null;
  },

  url: (value: string, fieldName: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  },

  phoneNumber: (value: string): string | null => {
    if (!value) return null;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number';
    return null;
  },
};

export function validateField(fieldName: string, value: string | number | boolean, rules: Array<() => string | null>): string | null {
  for (const rule of rules) {
    const error = rule();
    if (error) return error;
  }
  return null;
}

export function clearFieldError(errors: ValidationError, fieldName: string): ValidationError {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
}

export function setFieldError(errors: ValidationError, fieldName: string, error: string | null): ValidationError {
  const newErrors = { ...errors };
  if (error) {
    newErrors[fieldName] = error;
  } else {
    delete newErrors[fieldName];
  }
  return newErrors;
}
