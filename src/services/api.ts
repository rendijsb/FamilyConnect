// src/services/api.ts - Platform-Aware Version
import axios from 'axios';
import { Platform } from 'react-native';

// Platform-specific API URL
const getApiUrl = () => {
    if (Platform.OS === 'ios') {
        return 'http://localhost:3000/api';
    } else {
        return 'http://10.0.2.2:3000/api';
    }
};

const API_BASE_URL = getApiUrl();

console.log('🌐 API Base URL:', API_BASE_URL); // For debugging

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    };
    token: string;
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.log('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.log('🔐 Authentication error');
        }
        return Promise.reject(error);
    }
);

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
        console.log('📤 Sending registration data:', userData);
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },
};