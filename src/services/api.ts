// src/services/api.ts - Enhanced with Retry Logic and Better Error Handling
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';

// Platform-specific API URL
const getApiUrl = () => {
    if (__DEV__) {
        // Development URLs
        if (Platform.OS === 'ios') {
            return 'http://localhost:3000/api';
        } else {
            return 'http://10.0.2.2:3000/api';
        }
    } else {
        // Production URL - replace with your actual production API URL
        return 'https://your-production-api.com/api';
    }
};

const API_BASE_URL = getApiUrl();

console.log('🌐 API Base URL:', API_BASE_URL);

// Enhanced axios instance with retry logic
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_BASE_URL,
        timeout: 15000, // 15 seconds
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    client.interceptors.request.use(
        (config) => {
            console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        (error) => {
            console.error('❌ Request Error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor with retry logic
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`);
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            console.error('❌ API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });

            // Retry logic for network errors and 5xx errors
            if (
                !originalRequest._retry &&
                (error.code === 'ECONNABORTED' ||
                    error.code === 'NETWORK_ERROR' ||
                    (error.response?.status >= 500 && error.response?.status < 600))
            ) {
                originalRequest._retry = true;

                console.log('🔄 Retrying API request...');

                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));

                return client(originalRequest);
            }

            // Handle specific error cases
            if (error.response?.status === 401) {
                console.log('🔐 Authentication error detected');
                // Token might be expired - the auth slice will handle this
            }

            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

// Types for API responses
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        phone?: string;
        familyId?: string;
        role: string;
        avatarUrl?: string;
        createdAt?: string;
    };
    token: string;
}

export interface FamilyResponse {
    id: string;
    name: string;
    familyCode: string;
    createdAt: string;
    updatedAt: string;
    members: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: string;
    }>;
    memberCount: number;
}

export interface UserResponse {
    user: {
        id: string;
        email: string;
        name: string;
        phone?: string;
        familyId?: string;
        role: string;
        avatarUrl?: string;
        createdAt: string;
    };
    family?: FamilyResponse;
}

// Helper function to add auth header
const withAuth = (token: string): AxiosRequestConfig => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

// Auth API
export const authAPI = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        familyCode?: string;
    }): Promise<AuthResponse> => {
        console.log('📤 Sending registration data:', { ...userData, password: '[HIDDEN]' });
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    getCurrentUser: async (token: string): Promise<UserResponse> => {
        const response = await apiClient.get('/auth/me', withAuth(token));
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    refreshToken: async (token: string): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/refresh', {}, withAuth(token));
        return response.data;
    },
};

// Family API
export const familyAPI = {
    create: async (token: string, data: {
        name: string;
        description?: string;
    }): Promise<FamilyResponse> => {
        const response = await apiClient.post('/families', data, withAuth(token));
        return response.data;
    },

    validate: async (token: string, familyCode: string): Promise<{
        id: string;
        name: string;
        memberCount: number;
        members: Array<any>;
        createdAt: string;
    }> => {
        const response = await apiClient.get(`/families/validate/${familyCode}`, withAuth(token));
        return response.data;
    },

    join: async (token: string, familyCode: string): Promise<{
        message: string;
        user: any;
        family: FamilyResponse;
    }> => {
        const response = await apiClient.post('/families/join', { familyCode }, withAuth(token));
        return response.data;
    },

    getDetails: async (token: string, familyId: string): Promise<FamilyResponse> => {
        const response = await apiClient.get(`/families/${familyId}/details`, withAuth(token));
        return response.data;
    },

    getMembers: async (token: string, familyId: string): Promise<Array<any>> => {
        const response = await apiClient.get(`/families/${familyId}/members`, withAuth(token));
        return response.data;
    },

    inviteMember: async (token: string, familyId: string, email: string): Promise<{
        message: string;
        invitedEmail: string;
    }> => {
        const response = await apiClient.post(`/families/${familyId}/invite`, { email }, withAuth(token));
        return response.data;
    },

    updateMemberRole: async (token: string, familyId: string, memberId: string, role: string): Promise<any> => {
        const response = await apiClient.patch(
            `/families/${familyId}/members/${memberId}/role`,
            { role },
            withAuth(token)
        );
        return response.data;
    },

    removeMember: async (token: string, familyId: string, memberId: string): Promise<{
        message: string;
    }> => {
        const response = await apiClient.delete(
            `/families/${familyId}/members/${memberId}`,
            withAuth(token)
        );
        return response.data;
    },
};

// Location API
export const locationAPI = {
    update: async (token: string, data: {
        latitude: number;
        longitude: number;
        address?: string;
    }): Promise<any> => {
        const response = await apiClient.post('/locations', data, withAuth(token));
        return response.data;
    },

    getHistory: async (token: string, userId?: string): Promise<Array<any>> => {
        const url = userId ? `/locations/history/${userId}` : '/locations/history';
        const response = await apiClient.get(url, withAuth(token));
        return response.data;
    },
};

// Expense API
export const expenseAPI = {
    create: async (token: string, data: {
        amount: number;
        description: string;
        category?: string;
        splits: Array<{ userId: string; amount: number }>;
    }): Promise<any> => {
        const response = await apiClient.post('/expenses', data, withAuth(token));
        return response.data;
    },

    getAll: async (token: string): Promise<Array<any>> => {
        const response = await apiClient.get('/expenses', withAuth(token));
        return response.data;
    },

    update: async (token: string, expenseId: string, data: any): Promise<any> => {
        const response = await apiClient.put(`/expenses/${expenseId}`, data, withAuth(token));
        return response.data;
    },

    delete: async (token: string, expenseId: string): Promise<void> => {
        await apiClient.delete(`/expenses/${expenseId}`, withAuth(token));
    },
};

// Recipe API
export const recipeAPI = {
    create: async (token: string, data: {
        title: string;
        description?: string;
        prepTime?: number;
        cookTime?: number;
        servings?: number;
        ingredients: any;
        instructions: any;
        imageUrl?: string;
    }): Promise<any> => {
        const response = await apiClient.post('/recipes', data, withAuth(token));
        return response.data;
    },

    getAll: async (token: string): Promise<Array<any>> => {
        const response = await apiClient.get('/recipes', withAuth(token));
        return response.data;
    },

    getById: async (token: string, recipeId: string): Promise<any> => {
        const response = await apiClient.get(`/recipes/${recipeId}`, withAuth(token));
        return response.data;
    },

    update: async (token: string, recipeId: string, data: any): Promise<any> => {
        const response = await apiClient.put(`/recipes/${recipeId}`, data, withAuth(token));
        return response.data;
    },

    delete: async (token: string, recipeId: string): Promise<void> => {
        await apiClient.delete(`/recipes/${recipeId}`, withAuth(token));
    },
};

// Health check
export const healthAPI = {
    check: async (): Promise<{ status: string; timestamp: string }> => {
        const response = await apiClient.get('/health');
        return response.data;
    },
};

// Utility function to check if error is network related
export const isNetworkError = (error: any): boolean => {
    return !error.response && (
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error'
    );
};

// Utility function to check if error is server related
export const isServerError = (error: any): boolean => {
    return error.response && error.response.status >= 500;
};

// Utility function to get user-friendly error message
export const getErrorMessage = (error: any): string => {
    if (isNetworkError(error)) {
        return 'Network error. Please check your internet connection and try again.';
    }

    if (isServerError(error)) {
        return 'Server error. Please try again later.';
    }

    if (error.response?.status === 401) {
        return 'Authentication failed. Please log in again.';
    }

    if (error.response?.status === 403) {
        return 'You do not have permission to perform this action.';
    }

    if (error.response?.status === 404) {
        return 'The requested resource was not found.';
    }

    if (error.response?.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
    }

    return error.response?.data?.error || error.message || 'An unexpected error occurred.';
};

export default apiClient;