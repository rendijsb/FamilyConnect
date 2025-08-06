// src/services/api.ts - FIXED VERSION
import axios, {AxiosResponse} from 'axios';

const API_BASE_URL = 'http://10.0.2.2:3000/api';

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
        // We'll add token from redux store later
        const token = null; // TODO: Get from store

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response.data; // Return just the data
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, could logout user here
            console.log('Authentication error');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (email: string, password: string): Promise<AxiosResponse<any>> => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response;
    },

    register: async (userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        familyCode?: string;
    }): Promise<AxiosResponse<any>> => {
        const response = await apiClient.post('/auth/register', userData);
        return response;
    },

    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response;
    },
};