/**
 * validation.js
 * Production-ready form validation utilities
 */

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone.replace(/\D/g, ""));
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequired = (value) => {
  return value !== "" && value !== null && value !== undefined;
};

export const validateMinLength = (value, min) => {
  return value.length >= min;
};

export const validateMaxLength = (value, max) => {
  return value.length <= max;
};

export const validateNumber = (value) => {
  return !isNaN(value) && value !== "";
};

export const validateAmount = (value) => {
  return /^\d+(\.\d{1,2})?$/.test(value);
};

export const createValidator = (rules) => {
  return (values) => {
    const errors = {};

    Object.keys(rules).forEach((field) => {
      const fieldRules = rules[field];
      const value = values[field];

      if (fieldRules.required && !validateRequired(value)) {
        errors[field] = `${field} is required`;
      } else if (fieldRules.email && !validateEmail(value)) {
        errors[field] = "Invalid email address";
      } else if (fieldRules.phone && !validatePhone(value)) {
        errors[field] = "Invalid phone number (10 digits required)";
      } else if (fieldRules.password && !validatePassword(value)) {
        errors[field] = "Password must be at least 8 characters";
      } else if (
        fieldRules.minLength &&
        !validateMinLength(value, fieldRules.minLength)
      ) {
        errors[field] = `Must be at least ${fieldRules.minLength} characters`;
      } else if (
        fieldRules.maxLength &&
        !validateMaxLength(value, fieldRules.maxLength)
      ) {
        errors[field] =
          `Must be no more than ${fieldRules.maxLength} characters`;
      } else if (fieldRules.amount && !validateAmount(value)) {
        errors[field] = "Invalid amount (format: 0.00)";
      } else if (fieldRules.number && !validateNumber(value)) {
        errors[field] = "Must be a number";
      } else if (fieldRules.custom) {
        const customError = fieldRules.custom(value);
        if (customError) {
          errors[field] = customError;
        }
      }
    });

    return errors;
  };
};

/**
 * Validation Rules Schema
 * Example:
 *
 * const validator = createValidator({
 *   name: { required: true, minLength: 3 },
 *   email: { required: true, email: true },
 *   phone: { phone: true },
 *   age: { number: true, custom: (v) => v < 18 ? "Must be 18+" : null },
 * });
 */
