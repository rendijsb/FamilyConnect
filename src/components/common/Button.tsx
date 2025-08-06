// src/components/common/Button.tsx
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  onPress,
                                                  variant = 'primary',
                                                  size = 'medium',
                                                  disabled = false,
                                                  loading = false,
                                                  style,
                                                  textStyle,
                                              }) => {
    const buttonStyle = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const buttonTextStyle = [
        styles.buttonText,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.secondary} />
            ) : (
                <Text style={buttonTextStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.xl,
        ...shadows.sm,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.accent,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 36,
    },
    medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 48,
    },
    large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        minHeight: 56,
    },
    disabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontWeight: typography.weights.bold,
        textAlign: 'center',
    },
    primaryText: {
        color: colors.secondary,
    },
    secondaryText: {
        color: colors.secondary,
    },
    outlineText: {
        color: colors.primary,
    },
    smallText: {
        fontSize: typography.sizes.sm,
    },
    mediumText: {
        fontSize: typography.sizes.md,
    },
    largeText: {
        fontSize: typography.sizes.lg,
    },
    disabledText: {
        opacity: 0.7,
    },
});




