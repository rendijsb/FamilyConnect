// src/components/common/Input.tsx
import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                leftIcon,
                                                rightIcon,
                                                onRightIconPress,
                                                containerStyle,
                                                style,
                                                ...props
                                            }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.focused,
                error && styles.error,
            ]}>
                {leftIcon && (
                    <Icon name={leftIcon} size={20} color={colors.textSecondary} style={styles.leftIcon} />
                )}
                <TextInput
                    style={[styles.input, style]}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={colors.textSecondary}
                    {...props}
                />
                {rightIcon && (
                    <Icon
                        name={rightIcon}
                        size={20}
                        color={colors.textSecondary}
                        style={styles.rightIcon}
                        onPress={onRightIconPress}
                    />
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
    },
    focused: {
        borderColor: colors.primary,
    },
    error: {
        borderColor: colors.error,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.text,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIcon: {
        marginLeft: spacing.sm,
    },
    errorText: {
        fontSize: typography.sizes.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});