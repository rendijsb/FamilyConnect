// App.tsx - Fixed with Yellow Box hiding
import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar, StyleSheet } from 'react-native';
import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { ThemeProvider } from './src/constants/theme';

// Hide development warnings that cause yellow boxes
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
]);

function App(): React.JSX.Element {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
                <ThemeProvider>
                    <NavigationContainer>
                        <StatusBar barStyle="light-content" backgroundColor="#8B0000" />
                        <AppNavigator />
                    </NavigationContainer>
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;