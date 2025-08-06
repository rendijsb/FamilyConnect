// src/components/common/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, typography } from '../../constants/theme';

interface HeaderProps {
    title: string;
    leftIcon?: string;
    rightIcon?: string;
    onLeftPress?: () => void;
    onRightPress?: () => void;
    backgroundColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
                                                  title,
                                                  leftIcon,
                                                  rightIcon,
                                                  onLeftPress,
                                                  onRightPress,
                                                  backgroundColor = colors.primary,
                                              }) => {
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    {leftIcon && (
                        <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                            <Icon name={leftIcon} size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.centerSection}>
                    <Text style={styles.title}>{title}</Text>
                </View>

                <View style={styles.rightSection}>
                    {rightIcon && (
                        <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                            <Icon name={rightIcon} size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.primary,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 56,
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
    },
    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    iconButton: {
        padding: spacing.xs,
    },
});