// src/utils/constants.ts
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
        REFRESH: '/auth/refresh',
    },
    FAMILY: {
        CREATE: '/families',
        JOIN: '/families/join',
        MEMBERS: '/families/:id/members',
    },
    USER: {
        PROFILE: '/users/profile',
        LOCATION: '/locations',
    },
    EXPENSES: {
        LIST: '/expenses',
        CREATE: '/expenses',
        UPDATE: '/expenses/:id',
        DELETE: '/expenses/:id',
    },
} as const;

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    FAMILY_DATA: 'family_data',
    APP_SETTINGS: 'app_settings',
} as const;

export const PERMISSIONS = {
    LOCATION: 'location',
    CAMERA: 'camera',
    PHOTO_LIBRARY: 'photo_library',
    NOTIFICATIONS: 'notifications',
} as const;