// src/components/common/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: keyof typeof spacing;
    shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              style,
                                              padding = 'md',
                                              shadow = true,
                                          }) => {
    return (
        <View style={[
            styles.card,
            { padding: spacing[padding] },
            shadow && shadows.md,
            style,
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
