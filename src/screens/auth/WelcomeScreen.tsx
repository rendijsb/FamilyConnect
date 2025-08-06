// src/screens/auth/WelcomeScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../constants/theme';

type WelcomeScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>FC</Text>
                    </View>
                    <Text style={styles.title}>FamilyConnect</Text>
                    <Text style={styles.subtitle}>
                        The only family app you need - bringing your family closer together
                    </Text>
                </View>

                <View style={styles.featuresContainer}>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>📍</Text>
                        <Text style={styles.featureText}>Real-time location sharing</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>💰</Text>
                        <Text style={styles.featureText}>Shared expense tracking</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🍳</Text>
                        <Text style={styles.featureText}>Family recipe collection</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>📢</Text>
                        <Text style={styles.featureText}>Family announcements</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Get Started"
                        onPress={() => navigation.navigate('Register')}
                        size="large"
                        style={styles.primaryButton}
                    />
                    <Button
                        title="I already have an account"
                        onPress={() => navigation.navigate('Login')}
                        variant="outline"
                        size="large"
                        style={styles.secondaryButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        justifyContent: 'space-between',
        paddingBottom: spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: spacing.xxl * 2,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logoText: {
        fontSize: 32,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
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
        lineHeight: typography.lineHeights.md,
    },
    featuresContainer: {
        marginVertical: spacing.xl,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: spacing.md,
        width: 32,
    },
    featureText: {
        fontSize: typography.sizes.md,
        color: colors.text,
        flex: 1,
    },
    buttonContainer: {
        gap: spacing.md,
    },
    primaryButton: {
        marginBottom: spacing.sm,
    },
    secondaryButton: {
        marginBottom: spacing.lg,
    },
});
