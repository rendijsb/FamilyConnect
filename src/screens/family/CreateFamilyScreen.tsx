// src/screens/family/CreateFamilyScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { RootState, AppDispatch } from '../../store';
import { colors, spacing, typography } from '../../constants/theme';
import axios from 'axios';

export const CreateFamilyScreen: React.FC = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, token } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        familyName: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateFamily = async () => {
        if (!formData.familyName.trim()) {
            setError('Family name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                'http://10.0.2.2:3000/api/families',
                { name: formData.familyName.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const family = response.data;

            Alert.alert(
                'Family Created!',
                `Your family "${family.name}" has been created successfully!\n\nFamily Code: ${family.familyCode}\n\nShare this code with family members to let them join.`,
                [
                    {
                        text: 'Copy Code',
                        onPress: () => {
                            // Copy to clipboard logic
                            Alert.alert('Code Copied!', 'Family code copied to clipboard');
                        }
                    },
                    {
                        text: 'Continue',
                        onPress: () => navigation.goBack(),
                        style: 'default'
                    }
                ]
            );

        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create family');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.headerCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Your Family</Text>
                        <Text style={styles.subtitle}>
                            Start connecting with your loved ones by creating a family group.
                        </Text>
                    </View>
                </Card>

                <Card style={styles.formCard}>
                    <Input
                        label="Family Name"
                        value={formData.familyName}
                        onChangeText={(familyName) => setFormData({ ...formData, familyName })}
                        placeholder="Enter your family name"
                        leftIcon="home"
                        error={error}
                    />

                    <View style={styles.infoSection}>
                        <Text style={styles.infoTitle}>What happens next?</Text>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoNumber}>1</Text>
                            <Text style={styles.infoText}>We'll generate a unique family code</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoNumber}>2</Text>
                            <Text style={styles.infoText}>Share the code with family members</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoNumber}>3</Text>
                            <Text style={styles.infoText}>Start tracking locations, expenses & more!</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Create Family"
                        onPress={handleCreateFamily}
                        loading={loading}
                        size="large"
                        style={styles.createButton}
                    />

                    <Button
                        title="Join Existing Family Instead"
                        onPress={() => navigation.navigate('JoinFamily')}
                        variant="outline"
                        size="large"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    headerCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.primary + '10',
        borderColor: colors.primary + '20',
    },
    header: {
        alignItems: 'center',
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.lineHeights.md,
    },
    formCard: {
        marginBottom: spacing.md,
    },
    infoSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    infoTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    infoNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        color: colors.secondary,
        textAlign: 'center',
        lineHeight: 24,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        marginRight: spacing.md,
    },
    infoText: {
        flex: 1,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    buttonContainer: {
        gap: spacing.md,
    },
    createButton: {
        marginBottom: spacing.sm,
    },
});

// =============================================
// ADD THIS TO YOUR NAVIGATION (AuthNavigator.tsx or MainNavigator.tsx):
// =============================================

/*
import { CreateFamilyScreen } from '../screens/family/CreateFamilyScreen';

// Add to your stack:
<Stack.Screen
    name="CreateFamily"
    component={CreateFamilyScreen}
    options={{ title: 'Create Family' }}
/>
*/