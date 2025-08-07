import React, { useEffect, useState } from 'react';
import { LogBox, StatusBar, StyleSheet, Platform, Alert, AppState, AppStateStatus } from 'react-native';
import { NavigationContainer, DefaultTheme, NavigationContainerRef } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';
import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { ThemeProvider } from './src/constants/theme';
import { colors } from './src/constants/theme';
const navigationRef = React.createRef<NavigationContainerRef<any>>();

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'Warning: Failed prop type',
    'componentWillReceiveProps has been renamed',
    'componentWillMount has been renamed',
    'Animated: `useNativeDriver` was not specified',
    'Setting a timer for a long period of time',
    'Can\'t perform a React state update on an unmounted component',
    'TextInput',
    'findNodeHandle is deprecated',
    'Source.uri should not be an empty string',
    'Each child in a list should have a unique "key" prop',
    'Require cycle:', // React Navigation warning
    '[Reanimated]', // Reanimated warnings
    'ViewPropTypes will be removed', // Deprecated ViewPropTypes warning
]);

// Custom navigation theme
const AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
    },
};

function App(): React.JSX.Element {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    useEffect(() => {
        console.log('🚀 FamilyConnect App Starting...');

        // Network connectivity monitoring
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            console.log('🌐 Network state changed:', {
                isConnected: state.isConnected,
                type: state.type,
                isInternetReachable: state.isInternetReachable
            });

            const connected = state.isConnected && state.isInternetReachable;
            setIsConnected(connected ?? false);

            // Show alert when connection is lost
            if (!connected && isConnected) {
                Alert.alert(
                    'No Internet Connection',
                    'Please check your internet connection and try again.',
                    [{ text: 'OK' }]
                );
            }
        });

        // App state monitoring
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            console.log('📱 App state changed:', {
                previous: appState,
                current: nextAppState
            });

            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                console.log('🔄 App has come to foreground - checking for updates...');
                // App has come to foreground - could refresh data here
            }

            setAppState(nextAppState);
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        // Cleanup
        return () => {
            unsubscribeNetInfo();
            appStateSubscription?.remove();
        };
    }, [isConnected, appState]);

    // Handle navigation state changes
    const onNavigationStateChange = (state: any) => {
        // Log navigation for debugging
        if (__DEV__) {
            const getCurrentRouteName = (state: any): string => {
                if (!state || typeof state.index !== 'number') {
                    return 'Unknown';
                }

                const route = state.routes[state.index];

                if (route.state) {
                    return getCurrentRouteName(route.state);
                }

                return route.name;
            };

            const currentRouteName = getCurrentRouteName(state);
            console.log('🧭 Navigation changed to:', currentRouteName);
        }
    };

    // Handle deep linking
    const linking = {
        prefixes: ['familyconnect://', 'https://familyconnect.app'],
        config: {
            screens: {
                AuthStack: {
                    screens: {
                        Welcome: 'welcome',
                        Login: 'login',
                        Register: 'register',
                        ForgotPassword: 'forgot-password',
                    },
                },
                MainStack: {
                    screens: {
                        HomeTab: 'home',
                        FamilyTab: {
                            screens: {
                                FamilyHub: 'family',
                                CreateFamily: 'family/create',
                                JoinFamily: 'family/join',
                                FamilyMembers: 'family/members',
                            },
                        },
                        ProfileTab: 'profile',
                    },
                },
            },
        },
    };

    return (
        <ErrorBoundary>
            <Provider store={store}>
                <PersistGate
                    loading={<LoadingScreen text="Loading your data..." />}
                    persistor={persistor}
                >
                    <ThemeProvider>
                        <StatusBar
                            barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                            backgroundColor={colors.primary}
                            translucent={false}
                        />
                        <NavigationContainer
                            ref={navigationRef}
                            theme={AppTheme}
                            linking={linking}
                            onStateChange={onNavigationStateChange}
                            fallback={<LoadingScreen text="Preparing navigation..." />}
                            onReady={() => {
                                console.log('✅ Navigation container ready');
                            }}
                        >
                            <AppNavigator />
                        </NavigationContainer>
                    </ThemeProvider>
                </PersistGate>
            </Provider>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;