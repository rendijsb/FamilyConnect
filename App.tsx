import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'react-native';
import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { ThemeProvider } from './src/constants/theme.tsx';

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

export default App;