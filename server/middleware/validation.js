/**
 * PHASE 4: REQUEST VALIDATION MIDDLEWARE
 * Validate incoming requests with Joi or custom validators
 */

// ✅ Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Validate phone number
export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s+\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

// ✅ Validate password strength
export const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// ✅ Validate restaurant name
export const validateRestaurantName = (name) => {
  return name && name.length >= 3 && name.length <= 100;
};

// ✅ Validate amount (positive number)
export const validateAmount = (amount) => {
  return !isNaN(amount) && amount > 0;
};

// ✅ Validate date format
export const validateDate = (date) => {
  return !isNaN(Date.parse(date));
};

// ✅ Validate table number
export const validateTableNumber = (number) => {
  return !isNaN(number) && number > 0 && number <= 999;
};

// ✅ Validate quantity
export const validateQuantity = (quantity) => {
  return !isNaN(quantity) && quantity > 0 && quantity <= 999;
};

// ✅ Validate URL
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ✅ Validation middleware for common requests
export const validateRequestBody = (requiredFields = []) => {
  return (req, res, next) => {
    const errors = [];

    // Check for required fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
};

// ✅ Validation middleware for email
export const validateEmailField = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email is required",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
    });
  }

  next();
};

// ✅ Validation middleware for password
export const validatePasswordField = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: "Password is required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 8 characters long",
    });
  }

  next();
};

// ✅ Validation middleware for payment
export const validatePaymentData = (req, res, next) => {
  const { amount, paymentMethod } = req.body;
  const errors = [];

  if (!amount) {
    errors.push("Amount is required");
  } else if (!validateAmount(amount)) {
    errors.push("Amount must be a positive number");
  }

  if (!paymentMethod) {
    errors.push("Payment method is required");
  } else if (!["CASH", "CARD", "DIGITAL", "CHEQUE"].includes(paymentMethod)) {
    errors.push("Invalid payment method");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Payment validation failed",
      details: errors,
    });
  }

  next();
};

// ✅ Validation middleware for order data
export const validateOrderData = (req, res, next) => {
  const { items, tableId } = req.body;
  const errors = [];

  if (!items || !Array.isArray(items)) {
    errors.push("Items array is required");
  } else if (items.length === 0) {
    errors.push("At least one item is required");
  } else {
    // Validate each item
    items.forEach((item, index) => {
      if (!item.itemId) {
        errors.push(`Item ${index + 1}: itemId is required`);
      }
      if (!validateQuantity(item.quantity)) {
        errors.push(`Item ${index + 1}: Invalid quantity`);
      }
    });
  }

  if (!tableId) {
    errors.push("Table ID is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Order validation failed",
      details: errors,
    });
  }

  next();
};

// ✅ Validation middleware for date range
export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  const errors = [];

  if (startDate && !validateDate(startDate)) {
    errors.push("Invalid startDate format");
  }

  if (endDate && !validateDate(endDate)) {
    errors.push("Invalid endDate format");
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.push("startDate cannot be after endDate");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Date validation failed",
      details: errors,
    });
  }

  next();
};

// ✅ Sanitize input (remove dangerous characters)
export const sanitizeInput = (req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === "string") {
      // Remove HTML tags
      return value.replace(/<[^>]*>/g, "");
    }
    return value;
  };

  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      req.body[key] = sanitize(req.body[key]);
    });
  }

  // Sanitize query
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      req.query[key] = sanitize(req.query[key]);
    });
  }

  next();
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRestaurantName,
  validateAmount,
  validateDate,
  validateTableNumber,
  validateQuantity,
  validateUrl,
  validateRequestBody,
  validateEmailField,
  validatePasswordField,
  validatePaymentData,
  validateOrderData,
  validateDateRange,
  sanitizeInput,
};
