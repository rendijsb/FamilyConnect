import React, { useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                leftIcon,
                                                rightIcon,
                                                onRightIconPress,
                                                containerStyle,
                                                style,
                                                isPassword = false,
                                                secureTextEntry: propSecureTextEntry,
                                                ...props
                                            }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isSecureField = isPassword || propSecureTextEntry;
    const secureTextEntry = isSecureField && !showPassword;

    const handleRightIconPress = () => {
        if (isPassword || propSecureTextEntry) {
            setShowPassword(!showPassword);
        } else if (onRightIconPress) {
            onRightIconPress();
        }
    };

    const finalRightIcon = (isPassword || propSecureTextEntry)
        ? (showPassword ? 'visibility-off' : 'visibility')
        : rightIcon;

    const getAutoCompleteType = () => {
        if (isPassword || propSecureTextEntry) {
            return Platform.OS === 'android' ? 'password' : 'password';
        }
        if (props.keyboardType === 'email-address') {
            return 'email';
        }
        return 'off';
    };

    const getTextContentType = () => {
        if (Platform.OS === 'ios') {
            if (isPassword || propSecureTextEntry) {
                return 'password' as const;
            }
            if (props.keyboardType === 'email-address') {
                return 'emailAddress' as const;
            }
        }
        return 'none' as const;
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
                    <Icon name={leftIcon} size={20} color={colors.textSecondary} style={styles.leftIcon} />
                )}
                <TextInput
                    style={[styles.input, style]}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={secureTextEntry}
                    // Fix autocomplete issues
                    autoComplete={getAutoCompleteType() as any}
                    textContentType={getTextContentType()}
                    autoCorrect={false}
                    autoCapitalize={isSecureField ? 'none' : props.autoCapitalize}
                    // Prevent autocomplete yellow line
                    importantForAutofill="no"
                    {...props}
                />
                {finalRightIcon && (
                    <TouchableOpacity onPress={handleRightIconPress} style={styles.rightIconContainer}>
                        <Icon
                            name={finalRightIcon}
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
        // Prevent autocomplete overlay issues
        position: 'relative',
        overflow: 'hidden',
    },
    focused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    error: {
        borderColor: colors.error,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.sm,
        fontSize: typography.sizes.md,
        color: colors.text,
        // Fix password input issues
        textAlignVertical: 'center',
        includeFontPadding: false,
        // Additional fixes for autocomplete
        ...(Platform.OS === 'android' && {
            fontFamily: 'Roboto',
        }),
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIconContainer: {
        padding: spacing.xs,
        marginLeft: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: typography.sizes.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});