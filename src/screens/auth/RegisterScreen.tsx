// src/screens/auth/RegisterScreen.tsx
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        if (!validateForm()) return;

        try {
            const userData = {
                name: formData.name.trim(),
                email: formData.email.toLowerCase(),
                password: formData.password,
                phone: formData.phone.trim() || undefined,
                familyCode: formData.familyCode.trim() || undefined,
            };

            await dispatch(registerUser(userData)).unwrap();
        } catch (error: any) {
            Alert.alert('Registration Failed', error || 'Please try again.');
        }
    };

    return (
        <SafeAreaView style={registerStyles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={registerStyles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={registerStyles.scrollContent}>
                    <View style={registerStyles.content}>
                        <View style={registerStyles.header}>
                            <Text style={registerStyles.title}>Create Account</Text>
                            <Text style={registerStyles.subtitle}>Join FamilyConnect today</Text>
                        </View>

                        <View style={registerStyles.form}>
                            <Input
                                label="Full Name"
                                value={formData.name}
                                onChangeText={(name) => setFormData({ ...formData, name })}
                                placeholder="Enter your full name"
                                leftIcon="person"
                                error={errors.name}
                            />

                            <Input
                                label="Email"
                                value={formData.email}
                                onChangeText={(email) => setFormData({ ...formData, email })}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon="email"
                                error={errors.email}
                            />

                            <Input
                                label="Phone (Optional)"
                                value={formData.phone}
                                onChangeText={(phone) => setFormData({ ...formData, phone })}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                                leftIcon="phone"
                            />

                            <Input
                                label="Password"
                                value={formData.password}
                                onChangeText={(password) => setFormData({ ...formData, password })}
                                placeholder="Create a password"
                                secureTextEntry={!showPassword}
                                leftIcon="lock"
                                rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                                error={errors.password}
                            />

                            <Input
                                label="Confirm Password"
                                value={formData.confirmPassword}
                                onChangeText={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
                                placeholder="Confirm your password"
                                secureTextEntry={!showConfirmPassword}
                                leftIcon="lock"
                                rightIcon={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                error={errors.confirmPassword}
                            />

                            <Input
                                label="Family Code (Optional)"
                                value={formData.familyCode}
                                onChangeText={(familyCode) => setFormData({ ...formData, familyCode })}
                                placeholder="Enter family code to join existing family"
                                autoCapitalize="characters"
                                leftIcon="group"
                            />
                        </View>

                        <View style={registerStyles.buttonContainer}>
                            <Button
                                title="Create Account"
                                onPress={handleRegister}
                                loading={loading}
                                size="large"
                                style={registerStyles.registerButton}
                            />

                            <View style={registerStyles.loginContainer}>
                                <Text style={registerStyles.loginText}>Already have an account? </Text>
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
        </SafeAreaView>
    );
};

const registerStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        justifyContent: 'space-between',
        paddingBottom: spacing.xl,
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
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    buttonContainer: {
        gap: spacing.lg,
    },
    registerButton: {
        marginBottom: spacing.md,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    loginText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
});