// src/store/slices/authSlice.ts - Enhanced with Better State Management
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authAPI, AuthResponse } from '../../services/api';
import { clearFamilyData, resetUserState } from './userSlice';

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    familyId?: string;
    role: string;
    avatarUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
    lastLoginTime: string | null;
    sessionExpired: boolean;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    isInitialized: false,
    lastLoginTime: null,
    sessionExpired: false,
};

// Enhanced async thunks with better error handling
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            console.log('🔐 Attempting login for:', email);
            const response: AuthResponse = await authAPI.login(email.toLowerCase().trim(), password);
            console.log('✅ Login successful for:', email);
            return response;
        } catch (error: any) {
            console.error('❌ Login failed:', error);

            let errorMessage = 'Login failed';

            if (error.response?.status === 401) {
                errorMessage = 'Invalid email or password';
            } else if (error.response?.status === 429) {
                errorMessage = 'Too many login attempts. Please try again later.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (!error.response) {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = error.response?.data?.error || 'Login failed';
            }

            return rejectWithValue(errorMessage);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        familyCode?: string;
    }, { rejectWithValue }) => {
        try {
            console.log('📝 Attempting registration for:', userData.email);

            // Clean and validate data
            const cleanUserData = {
                ...userData,
                email: userData.email.toLowerCase().trim(),
                name: userData.name.trim(),
                phone: userData.phone?.trim() || undefined,
                familyCode: userData.familyCode?.trim().toUpperCase() || undefined
            };

            const response: AuthResponse = await authAPI.register(cleanUserData);
            console.log('✅ Registration successful for:', userData.email);
            return response;
        } catch (error: any) {
            console.error('❌ Registration failed:', error);

            let errorMessage = 'Registration failed';

            if (error.response?.status === 400) {
                errorMessage = error.response.data?.error || 'Invalid registration data';
            } else if (error.response?.status === 409) {
                errorMessage = 'An account with this email already exists';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (!error.response) {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = error.response?.data?.error || 'Registration failed';
            }

            return rejectWithValue(errorMessage);
        }
    }
);

export const refreshUserData = createAsyncThunk(
    'auth/refreshUserData',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState() as { auth: AuthState };

            if (!auth.token) {
                throw new Error('No token available');
            }

            console.log('🔄 Refreshing user data...');
            const response = await authAPI.getCurrentUser(auth.token);
            console.log('✅ User data refreshed');
            return response;
        } catch (error: any) {
            console.error('❌ Failed to refresh user data:', error);

            if (error.response?.status === 401) {
                return rejectWithValue('Session expired');
            }

            return rejectWithValue('Failed to refresh user data');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        try {
            console.log('👋 Logging out user...');

            // Clear family and user data
            dispatch(clearFamilyData());
            dispatch(resetUserState());

            // You could also call an API endpoint to invalidate the token on the server
            // await authAPI.logout();

            console.log('✅ User logged out successfully');
            return;
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Even if there's an error, we still want to log out locally
            return;
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
            state.lastLoginTime = new Date().toISOString();
            state.sessionExpired = false;
            state.isInitialized = true;
        },

        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        setSessionExpired: (state) => {
            state.sessionExpired = true;
            state.isAuthenticated = false;
            state.error = 'Your session has expired. Please log in again.';
        },

        setInitialized: (state) => {
            state.isInitialized = true;
        },

        resetAuthState: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Login cases
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.sessionExpired = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.lastLoginTime = new Date().toISOString();
                state.sessionExpired = false;
                state.isInitialized = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            });

        // Register cases
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.lastLoginTime = new Date().toISOString();
                state.sessionExpired = false;
                state.isInitialized = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            });

        // Refresh user data cases
        builder
            .addCase(refreshUserData.pending, (state) => {
                // Don't set loading to true for refresh to avoid UI flickering
                state.error = null;
            })
            .addCase(refreshUserData.fulfilled, (state, action) => {
                if (state.user) {
                    state.user = { ...state.user, ...action.payload.user };
                }
                state.error = null;
            })
            .addCase(refreshUserData.rejected, (state, action) => {
                if (action.payload === 'Session expired') {
                    state.sessionExpired = true;
                    state.isAuthenticated = false;
                    state.user = null;
                    state.token = null;
                }
                state.error = action.payload as string;
            });

        // Logout cases
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                return {
                    ...initialState,
                    isInitialized: true,
                };
            })
            .addCase(logoutUser.rejected, (state) => {
                // Even if logout fails, clear the state
                return {
                    ...initialState,
                    isInitialized: true,
                };
            });
    },
});

export const {
    clearError,
    setCredentials,
    updateUser,
    setSessionExpired,
    setInitialized,
    resetAuthState
} = authSlice.actions;

export default authSlice.reducer;