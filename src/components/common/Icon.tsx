import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
}

const IconComponents: { [key: string]: React.FC<{ size: number; color: string }> } = {
    home: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <View style={[styles.house, {
                borderBottomColor: color,
                borderBottomWidth: size * 0.5,
                borderLeftWidth: size * 0.4,
                borderRightWidth: size * 0.4,
                borderTopWidth: size * 0.3,
                marginTop: size * 0.1
            }]} />
            <View style={[styles.roof, {
                width: size * 0.6,
                height: size * 0.6,
                borderBottomWidth: size * 0.3,
                borderBottomColor: color,
                borderLeftWidth: size * 0.3,
                borderRightWidth: size * 0.3,
                marginTop: -size * 0.4
            }]} />
        </View>
    ),

    person: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <View style={[styles.personHead, {
                width: size * 0.3,
                height: size * 0.3,
                borderRadius: size * 0.15,
                backgroundColor: color,
                marginTop: size * 0.1
            }]} />
            <View style={[styles.personBody, {
                width: size * 0.5,
                height: size * 0.4,
                borderRadius: size * 0.25,
                backgroundColor: color,
                marginTop: size * 0.1
            }]} />
        </View>
    ),

    email: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <View style={[styles.envelope, {
                width: size * 0.8,
                height: size * 0.6,
                borderWidth: size * 0.05,
                borderColor: color,
                borderRadius: size * 0.05,
            }]} />
            <View style={[styles.envelopeFlap, {
                width: size * 0.4,
                height: size * 0.3,
                borderLeftWidth: size * 0.05,
                borderRightWidth: size * 0.05,
                borderBottomWidth: size * 0.05,
                borderColor: color,
                marginTop: -size * 0.5,
                marginLeft: size * 0.2,
            }]} />
        </View>
    ),

    lock: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <View style={[styles.lockShackle, {
                width: size * 0.5,
                height: size * 0.3,
                borderWidth: size * 0.08,
                borderColor: color,
                borderRadius: size * 0.25,
                borderBottomWidth: 0,
                marginTop: size * 0.05
            }]} />
            <View style={[styles.lockBody, {
                width: size * 0.7,
                height: size * 0.5,
                backgroundColor: color,
                borderRadius: size * 0.08,
                marginTop: -size * 0.05
            }]} />
        </View>
    ),

    group: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.groupPerson, {
                    width: size * 0.25,
                    height: size * 0.8,
                    backgroundColor: color,
                    borderRadius: size * 0.125,
                    marginLeft: i * size * 0.2,
                    opacity: i === 1 ? 1 : 0.7,
                    transform: [{ scale: i === 1 ? 1 : 0.9 }]
                }]} />
            ))}
        </View>
    ),

    'chevron-right': ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <View style={[styles.chevron, {
                width: size * 0.3,
                height: size * 0.3,
                borderRightWidth: size * 0.1,
                borderTopWidth: size * 0.1,
                borderColor: color,
                transform: [{ rotate: '45deg' }]
            }]} />
        </View>
    ),

    'location-on': ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <View style={[styles.mapPin, {
                width: size * 0.6,
                height: size * 0.6,
                backgroundColor: color,
                borderRadius: size * 0.3,
                marginTop: size * 0.1
            }]} />
            <View style={[styles.mapPinPoint, {
                width: 0,
                height: 0,
                borderLeftWidth: size * 0.1,
                borderRightWidth: size * 0.1,
                borderTopWidth: size * 0.2,
                borderTopColor: color,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                marginTop: -size * 0.05,
                marginLeft: size * 0.2
            }]} />
        </View>
    ),

    'attach-money': ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.8,
                color: color,
                fontWeight: 'bold'
            }}>$</Text>
        </View>
    ),

    restaurant: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.8,
                color: color,
                fontWeight: 'bold'
            }}>🍽</Text>
        </View>
    ),

    announcement: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.8,
                color: color,
                fontWeight: 'bold'
            }}>📢</Text>
        </View>
    ),

    'more-horiz': ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.6,
                color: color,
                fontWeight: 'bold'
            }}>⋯</Text>
        </View>
    ),

    'check-circle': ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.8,
                color: color,
                fontWeight: 'bold'
            }}>✓</Text>
        </View>
    ),

    'group-add': ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.7,
                color: color,
                fontWeight: 'bold'
            }}>👥+</Text>
        </View>
    ),

    info: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <View style={[{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: size * 0.08,
                borderColor: color,
                justifyContent: 'center',
                alignItems: 'center'
            }]}>
                <Text style={{
                    fontSize: size * 0.6,
                    color: color,
                    fontWeight: 'bold'
                }}>i</Text>
            </View>
        </View>
    ),

    error: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.8,
                color: color,
                fontWeight: 'bold'
            }}>!</Text>
        </View>
    ),

    close: ({ size, color }) => (
        <View style={[styles.iconBase, { width: size, height: size }]}>
            <Text style={{
                fontSize: size * 0.8,
                color: color,
                fontWeight: 'bold'
            }}>×</Text>
        </View>
    ),

    // Add more icons as needed...
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
    const IconComponent = IconComponents[name];

    if (!IconComponent) {
        // Fallback to simple circle with first letter - FIXED: Text component instead of View
        return (
            <View style={[
                styles.fallbackIcon,
                { width: size, height: size, backgroundColor: color + '20' },
                style
            ]}>
                <Text style={[styles.fallbackText, {
                    fontSize: size * 0.5,
                    color: color,
                    lineHeight: size
                }]}>
                    {name.charAt(0).toUpperCase()}
                </Text>
            </View>
        );
    }

    return (
        <View style={[style, { width: size, height: size }]}>
            <IconComponent size={size} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    iconBase: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    house: {
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
    },
    roof: {
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
    },
    personHead: {
        alignSelf: 'center',
    },
    personBody: {
        alignSelf: 'center',
    },
    envelope: {
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    envelopeFlap: {
        backgroundColor: 'transparent',
        borderTopColor: 'transparent',
        alignSelf: 'center',
    },
    lockShackle: {
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    lockBody: {
        alignSelf: 'center',
    },
    groupPerson: {
        position: 'absolute',
    },
    chevron: {
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    mapPin: {
        alignSelf: 'center',
    },
    mapPinPoint: {
        alignSelf: 'center',
    },
    fallbackIcon: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
});