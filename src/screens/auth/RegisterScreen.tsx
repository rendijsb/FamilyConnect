// src/screens/auth/RegisterScreen.tsx - Bulletproof Version
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
import { registerUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { colors, spacing, typography } from '../../constants/theme';

type RegisterScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        familyCode: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        // Dismiss keyboard first
        Keyboard.dismiss();

        if (!validateForm()) return;

        try {
            const userData = {
                name: formData.name.trim(),
                email: formData.email.toLowerCase(),
                password: formData.password,
                phone: formData.phone.trim() || undefined,
                familyCode: formData.familyCode.trim() || undefined,
            };

            console.log('📝 Attempting registration for:', userData.email);
            await dispatch(registerUser(userData)).unwrap();
            console.log('✅ Registration successful');
        } catch (error: any) {
            console.error('❌ Registration failed:', error);
            Alert.alert('Registration Failed', error || 'Please try again.');
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
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
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>Join FamilyConnect today</Text>
                            </View>

                            <View style={styles.form}>
                                <Input
                                    label="Full Name"
                                    value={formData.name}
                                    onChangeText={(name) => {
                                        setFormData({ ...formData, name });
                                        clearError('name');
                                    }}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    textContentType="name"
                                    leftIcon="person"
                                    error={errors.name}
                                    returnKeyType="next"
                                />

                                <Input
                                    label="Email"
                                    value={formData.email}
                                    onChangeText={(email) => {
                                        setFormData({ ...formData, email });
                                        clearError('email');
                                    }}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    leftIcon="email"
                                    error={errors.email}
                                    returnKeyType="next"
                                />

                                <Input
                                    label="Phone (Optional)"
                                    value={formData.phone}
                                    onChangeText={(phone) => {
                                        setFormData({ ...formData, phone });
                                        clearError('phone');
                                    }}
                                    placeholder="Enter your phone number"
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    textContentType="telephoneNumber"
                                    leftIcon="phone"
                                    returnKeyType="next"
                                />

                                <Input
                                    label="Password"
                                    value={formData.password}
                                    onChangeText={(password) => {
                                        setFormData({ ...formData, password });
                                        clearError('password');
                                        clearError('confirmPassword');
                                    }}
                                    placeholder="Create a password"
                                    secureTextEntry={true}
                                    autoComplete="password-new"
                                    textContentType="newPassword"
                                    leftIcon="lock"
                                    error={errors.password}
                                    returnKeyType="next"
                                />

                                <Input
                                    label="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChangeText={(confirmPassword) => {
                                        setFormData({ ...formData, confirmPassword });
                                        clearError('confirmPassword');
                                    }}
                                    placeholder="Confirm your password"
                                    secureTextEntry={true}
                                    autoComplete="password-new"
                                    textContentType="newPassword"
                                    leftIcon="lock"
                                    error={errors.confirmPassword}
                                    returnKeyType="next"
                                />

                                <Input
                                    label="Family Code (Optional)"
                                    value={formData.familyCode}
                                    onChangeText={(familyCode) => {
                                        setFormData({ ...formData, familyCode });
                                        clearError('familyCode');
                                    }}
                                    placeholder="Enter family code to join existing family"
                                    autoCapitalize="characters"
                                    autoComplete="off"
                                    textContentType="none"
                                    leftIcon="group"
                                    returnKeyType="done"
                                    onSubmitEditing={handleRegister}
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Create Account"
                                    onPress={handleRegister}
                                    loading={loading}
                                    size="large"
                                    style={styles.registerButton}
                                />

                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginText}>Already have an account? </Text>
                                    <Button
                                        title="Sign In"
                                        onPress={() => navigation.navigate('Login')}
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
        paddingVertical: spacing.md,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        minHeight: 700, // Ensure enough space for all fields
    },
    header: {
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
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
        marginVertical: spacing.md,
    },
    buttonContainer: {
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    registerButton: {
        marginBottom: spacing.md,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    loginText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
});