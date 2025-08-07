// src/components/common/Input.tsx - Bulletproof Version (No Yellow Boxes)
import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Icon } from './Icon';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                leftIcon,
                                                rightIcon,
                                                onRightIconPress,
                                                containerStyle,
                                                style,
                                                secureTextEntry,
                                                autoComplete,
                                                textContentType,
                                                ...props
                                            }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const textInputRef = useRef<TextInput>(null);

    // Handle password visibility for password fields
    const isPasswordField = secureTextEntry !== undefined;
    const shouldShowPassword = isPasswordField && isPasswordVisible;
    const actualSecureTextEntry = isPasswordField && !isPasswordVisible;

    const handleRightIconPress = () => {
        if (isPasswordField && !onRightIconPress) {
            // Toggle password visibility
            setIsPasswordVisible(!isPasswordVisible);
        } else if (onRightIconPress) {
            onRightIconPress();
        }
    };

    // Determine right icon for password fields
    const actualRightIcon = isPasswordField && !rightIcon
        ? (isPasswordVisible ? 'visibility-off' : 'visibility')
        : rightIcon;

    // Fix autoComplete and textContentType to prevent warnings
    const getAutoCompleteValue = () => {
        if (autoComplete !== undefined) return autoComplete;
        if (isPasswordField) return 'password';
        return 'off';
    };

    const getTextContentType = () => {
        if (textContentType !== undefined) return textContentType;
        if (isPasswordField) return 'password';
        return 'none';
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.focused,
                error && styles.error,
            ]}>
                {leftIcon && (
                    <Icon
                        name={leftIcon}
                        size={20}
                        color={colors.textSecondary}
                        style={styles.leftIcon}
                    />
                )}
                <TextInput
                    ref={textInputRef}
                    style={[styles.input, style]}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={actualSecureTextEntry}
                    autoCorrect={false}
                    autoComplete={getAutoCompleteValue()}
                    textContentType={getTextContentType()}
                    spellCheck={false}
                    autoCapitalize={isPasswordField ? 'none' : props.autoCapitalize}
                    keyboardType={props.keyboardType || 'default'}
                    returnKeyType={props.returnKeyType || 'done'}
                    blurOnSubmit={true}
                    // Prevent warnings
                    importantForAutofill="no"
                    {...props}
                />
                {actualRightIcon && (
                    <TouchableOpacity
                        onPress={handleRightIconPress}
                        style={styles.rightIconContainer}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon
                            name={actualRightIcon}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
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
        minHeight: 48,
    },
    focused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    error: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    input: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
        fontSize: typography.sizes.md,
        color: colors.text,
        minHeight: Platform.OS === 'ios' ? 20 : 40,
        // Prevent layout shift warnings
        lineHeight: Platform.OS === 'ios' ? undefined : typography.sizes.md * 1.2,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIconContainer: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    errorText: {
        fontSize: typography.sizes.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});