// src/navigation/AppNavigator.tsx - Enhanced with Better State Management
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { RootState, AppDispatch } from '../store';
import { setInitialized, refreshUserData, setSessionExpired } from '../store/slices/authSlice';
import { RootStackParamList } from './types';
import { Alert } from 'react-native';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        isAuthenticated,
        isInitialized,
        sessionExpired,
        token,
        user,
        error
    } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Initialize the app and check authentication status
        initializeApp();
    }, []);

    useEffect(() => {
        // Handle session expiration
        if (sessionExpired) {
            Alert.alert(
                'Session Expired',
                'Your session has expired. Please log in again.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // The user will be redirected to auth screens automatically
                            // due to isAuthenticated being false
                        }
                    }
                ]
            );
        }
    }, [sessionExpired]);

    useEffect(() => {
        // Refresh user data periodically if authenticated
        if (isAuthenticated && token && user) {
            const refreshInterval = setInterval(() => {
                console.log('🔄 Refreshing user data periodically...');
                dispatch(refreshUserData());
            }, 5 * 60 * 1000); // Refresh every 5 minutes

            return () => clearInterval(refreshInterval);
        }
    }, [isAuthenticated, token, user, dispatch]);

    const initializeApp = async () => {
        try {
            console.log('🚀 Initializing app...');

            // If we have a token and user, try to refresh user data
            if (token && user) {
                console.log('👤 Found existing session, refreshing data...');
                try {
                    await dispatch(refreshUserData()).unwrap();
                    console.log('✅ User data refreshed successfully');
                } catch (error) {
                    console.error('❌ Failed to refresh user data:', error);

                    // If refresh fails due to invalid token, mark session as expired
                    if (error === 'Session expired') {
                        dispatch(setSessionExpired());
                    }
                }
            } else {
                console.log('🔓 No existing session found');
            }
        } catch (error) {
            console.error('❌ App initialization error:', error);
        } finally {
            // Mark app as initialized
            dispatch(setInitialized());
            console.log('✅ App initialization complete');
        }
    };

    // Show loading screen while initializing
    if (!isInitialized) {
        return <LoadingScreen text="Initializing FamilyConnect..." />;
    }

    // Show appropriate navigator based on authentication status
    return (
        <RootStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 300,
            }}
        >
            {isAuthenticated && !sessionExpired ? (
                <RootStack.Screen
                    name="MainStack"
                    component={MainNavigator}
                    options={{
                        animationTypeForReplace: 'push',
                    }}
                />
            ) : (
                <RootStack.Screen
                    name="AuthStack"
                    component={AuthNavigator}
                    options={{
                        animationTypeForReplace: 'pop',
                    }}
                />
            )}
        </RootStack.Navigator>
    );
};