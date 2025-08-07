// src/components/common/GradientView.tsx - No native linking required!
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/theme';

interface GradientViewProps {
    colors?: string[];
    style?: ViewStyle;
    children?: React.ReactNode;
    start?: { x: number; y: number };
    end?: { x: number; y: number };
}

export const GradientView: React.FC<GradientViewProps> = ({
                                                              colors: gradientColors = [colors.primary, colors.primaryLight],
                                                              style,
                                                              children,
                                                              start = { x: 0, y: 0 },
                                                              end = { x: 1, y: 1 }
                                                          }) => {
    const baseColor = gradientColors[0];
    const overlayColor = gradientColors[1] || gradientColors[0];

    return (
        <View style={[{ backgroundColor: baseColor }, style]}>
            <View style={[
                StyleSheet.absoluteFillObject,
                {
                    backgroundColor: overlayColor,
                    opacity: 0.3,
                }
            ]} />
            {children}
        </View>
    );
};