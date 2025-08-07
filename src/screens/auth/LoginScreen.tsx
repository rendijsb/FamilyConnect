// src/screens/auth/LoginScreen.tsx - Bulletproof Version
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AuthStackParamList } from '../../navigation/types';
import { loginUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { colors, spacing, typography } from '../../constants/theme';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        // Dismiss keyboard first
        Keyboard.dismiss();

        if (!validateForm()) return;

        try {
            console.log('🔐 Attempting login for:', formData.email);
            await dispatch(loginUser(formData)).unwrap();
            console.log('✅ Login successful');
        } catch (error: any) {
            console.error('❌ Login failed:', error);
            Alert.alert('Login Failed', error || 'Please check your credentials and try again.');
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Welcome Back!</Text>
                                <Text style={styles.subtitle}>Sign in to continue to FamilyConnect</Text>
                            </View>

                            <View style={styles.form}>
                                <Input
                                    label="Email"
                                    value={formData.email}
                                    onChangeText={(email) => {
                                        setFormData({ ...formData, email });
                                        if (errors.email) {
                                            setErrors({ ...errors, email: '' });
                                        }
                                    }}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    leftIcon="email"
                                    error={errors.email}
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                />

                                <Input
                                    label="Password"
                                    value={formData.password}
                                    onChangeText={(password) => {
                                        setFormData({ ...formData, password });
                                        if (errors.password) {
                                            setErrors({ ...errors, password: '' });
                                        }
                                    }}
                                    placeholder="Enter your password"
                                    secureTextEntry={true}
                                    autoComplete="password"
                                    textContentType="password"
                                    leftIcon="lock"
                                    error={errors.password}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />

                                <Button
                                    title="Forgot Password?"
                                    onPress={() => navigation.navigate('ForgotPassword')}
                                    variant="outline"
                                    size="small"
                                    style={styles.forgotButton}
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Sign In"
                                    onPress={handleLogin}
                                    loading={loading}
                                    size="large"
                                    style={styles.loginButton}
                                />

                                <View style={styles.signupContainer}>
                                    <Text style={styles.signupText}>Don't have an account? </Text>
                                    <Button
                                        title="Sign Up"
                                        onPress={() => navigation.navigate('Register')}
                                        variant="outline"
                                        size="small"
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        minHeight: 500, // Ensure enough space
    },
    header: {
        alignItems: 'center',
        marginTop: spacing.xxl,
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.lineHeights.md,
    },
    form: {
        flex: 1,
        justifyContent: 'center',
        marginVertical: spacing.lg,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: spacing.sm,
    },
    buttonContainer: {
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    loginButton: {
        marginBottom: spacing.md,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    signupText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
});