export const isStrongPassword = (password) => {
  if (typeof password !== 'string') {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    };
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    };
  }

  return {
    valid: true,
    message: 'Password is strong',
  };
};
