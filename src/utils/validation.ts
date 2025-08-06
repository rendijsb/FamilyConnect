// src/utils/validation.ts
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one number' };
    }
    return { isValid: true };
};