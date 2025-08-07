// src/screens/family/CreateFamilyScreen.tsx - RESILIENT VERSION (No API Dependencies)
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Alert,
    Clipboard,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { GradientView } from '../../components/common/GradientView';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RootState, AppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { setFamilyData } from '../../store/slices/userSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';

interface CreateFamilyScreenProps {
    navigation: any;
}

export const CreateFamilyScreen: React.FC<CreateFamilyScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { familyData } = useSelector((state: RootState) => state.user);

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        familyName: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [createdFamily, setCreatedFamily] = useState<any>(null);
    const [error, setError] = useState('');

    const slideAnim = new Animated.Value(0);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        // Start animations immediately - don't wait for API calls
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();

        // Check family status AFTER screen renders (non-blocking)
        checkExistingFamilyOptional();
    }, [currentStep]);

    const checkExistingFamilyOptional = async () => {
        try {
            // First check Redux state for existing family
            if (user?.familyId && familyData) {
                Alert.alert(
                    'Already in Family',
                    `You are already part of "${familyData.name}". Would you like to go to Family Hub?`,
                    [
                        { text: 'Stay Here', style: 'cancel' },
                        {
                            text: 'Go to Family Hub',
                            onPress: () => navigation.navigate('FamilyHub')
                        }
                    ]
                );
                return;
            }

            // Only try API call if we don't have family data in Redux
            if (!token) {
                console.log('⚠️ No token available, skipping family check');
                return;
            }

            const response = await axios.get(
                'http://localhost:3000/api/auth/me',
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000 // Short timeout
                }
            );

            const { user: freshUser, family } = response.data;

            if (family) {
                dispatch(setCredentials({ user: freshUser, token: token! }));
                dispatch(setFamilyData(family));

                Alert.alert(
                    'Already in Family',
                    `You are already part of "${family.name}". Would you like to go to Family Hub?`,
                    [
                        { text: 'Stay Here', style: 'cancel' },
                        {
                            text: 'Go to Family Hub',
                            onPress: () => navigation.navigate('FamilyHub')
                        }
                    ]
                );
            }
        } catch (error) {
            console.log('⚠️ Optional family check failed (non-critical):', error);
            // Don't show error to user - this is optional
        }
    };

    const validateForm = () => {
        if (!formData.familyName.trim()) {
            setError('Family name is required');
            return false;
        }
        if (formData.familyName.trim().length < 2) {
            setError('Family name must be at least 2 characters');
            return false;
        }
        if (formData.familyName.trim().length > 50) {
            setError('Family name must be less than 50 characters');
            return false;
        }
        setError('');
        return true;
    };

    const handleCreateFamily = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            console.log('🏗️ Creating family:', formData.familyName);

            const response = await axios.post(
                'http://localhost:3000/api/families',
                {
                    name: formData.familyName.trim(),
                    description: formData.description.trim() || undefined
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 15000
                }
            );

            const family = response.data;
            console.log('✅ Family created successfully:', family);

            // Update Redux state
            const updatedUser = { ...user!, familyId: family.id, role: 'admin' };
            dispatch(setCredentials({ user: updatedUser, token: token! }));
            dispatch(setFamilyData(family));

            setCreatedFamily(family);
            setCurrentStep(1);

        } catch (error: any) {
            console.error('❌ Family creation failed:', error);

            let errorMessage = 'Failed to create family';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Connection timeout. Please check your internet connection.';
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.error || 'Invalid family data';
            } else if (error.response?.status === 409) {
                errorMessage = 'You are already part of a family';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyFamilyCode = async () => {
        if (createdFamily?.familyCode) {
            try {
                await Clipboard.setString(createdFamily.familyCode);
                Alert.alert('Copied!', 'Family code copied to clipboard');
            } catch (error) {
                Alert.alert('Error', 'Failed to copy family code');
            }
        }
    };

    const shareFamilyCode = () => {
        if (createdFamily?.familyCode) {
            Alert.alert(
                'Share Family Code',
                `Share this code with family members:\n\n${createdFamily.familyCode}\n\nThey can use this code to join your family.`,
                [
                    { text: 'Copy Code', onPress: copyFamilyCode },
                    { text: 'OK' }
                ]
            );
        }
    };

    const goToFamilyHub = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'FamilyHub' }],
        });
    };

    const renderProgressIndicator = () => (
        <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        { width: `${((currentStep + 1) / 2) * 100}%` }
                    ]}
                />
            </View>
            <Text style={styles.progressText}>
                Step {currentStep + 1} of 2
            </Text>
        </View>
    );

    const renderFormStep = () => (
        <Animated.View style={[
            styles.stepContainer,
            {
                opacity: fadeAnim,
                transform: [
                    {
                        translateX: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                        }),
                    },
                ],
            },
        ]}>
            <View style={styles.headerSection}>
                <GradientView
                    colors={[colors.primary + '20', colors.accent + '10']}
                    style={styles.iconContainer}
                >
                    <Icon name="home" size={40} color={colors.primary} />
                </GradientView>

                <Text style={styles.stepTitle}>Create Your Family</Text>
                <Text style={styles.stepSubtitle}>Start your family's digital journey together</Text>
            </View>

            <Card style={styles.formCard}>
                <Input
                    label="Family Name *"
                    value={formData.familyName}
                    onChangeText={(familyName) => {
                        setFormData({ ...formData, familyName });
                        setError('');
                    }}
                    placeholder="Enter your family name"
                    leftIcon="home"
                    error={error}
                    maxLength={50}
                    autoFocus={true}
                />

                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description (Optional)</Text>
                    <TextInput
                        style={styles.descriptionInput}
                        value={formData.description}
                        onChangeText={(description) => setFormData({ ...formData, description })}
                        placeholder="Describe your family... (e.g., The Johnson Family - Always there for each other)"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        maxLength={200}
                        placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={styles.characterCount}>
                        {formData.description.length}/200 characters
                    </Text>
                </View>
            </Card>

            <Card style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>What you'll get:</Text>
                <View style={styles.benefitsList}>
                    {[
                        { icon: 'location-on', text: 'Real-time location sharing with family members' },
                        { icon: 'attach-money', text: 'Shared expense tracking and bill splitting' },
                        { icon: 'group', text: 'Family member management and invitations' },
                        { icon: 'announcement', text: 'Family announcements and messaging' },
                    ].map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <View style={styles.benefitIcon}>
                                <Icon name={benefit.icon} size={16} color={colors.primary} />
                            </View>
                            <Text style={styles.benefitText}>{benefit.text}</Text>
                        </View>
                    ))}
                </View>
            </Card>

            <Button
                title={loading ? "Creating Family..." : "Create Family"}
                onPress={handleCreateFamily}
                loading={loading}
                disabled={loading || !formData.familyName.trim()}
                size="large"
                style={styles.createButton}
            />

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
            >
                <Text style={styles.backButtonText}>← Back to Family Hub</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderSuccessStep = () => (
        <Animated.View style={[
            styles.stepContainer,
            {
                opacity: fadeAnim,
                transform: [
                    {
                        translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                        }),
                    },
                ],
            },
        ]}>
            <View style={styles.successHeader}>
                <GradientView
                    colors={[colors.success, colors.success + 'CC']}
                    style={styles.successIcon}
                >
                    <Text style={styles.successCheckmark}>✓</Text>
                </GradientView>

                <Text style={styles.successTitle}>Family Created Successfully!</Text>
                <Text style={styles.successSubtitle}>
                    Your family "{createdFamily?.name}" is ready to connect
                </Text>
            </View>

            <Card style={styles.familyCodeCard}>
                <Text style={styles.familyCodeTitle}>Your Family Code</Text>
                <TouchableOpacity onPress={copyFamilyCode} style={styles.familyCodeContainer}>
                    <Text style={styles.familyCode}>{createdFamily?.familyCode}</Text>
                    <View style={styles.copyIcon}>
                        <Icon name="copy" size={16} color={colors.primary} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.familyCodeDescription}>
                    Share this code with family members so they can join your family. Tap to copy!
                </Text>
            </Card>

            <Card style={styles.nextStepsCard}>
                <Text style={styles.nextStepsTitle}>Next Steps</Text>
                <View style={styles.nextStepsList}>
                    <View style={styles.nextStepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.nextStepText}>Share your family code with members</Text>
                    </View>
                    <View style={styles.nextStepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.nextStepText}>Set up location sharing preferences</Text>
                    </View>
                    <View style={styles.nextStepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.nextStepText}>Start tracking expenses and sharing recipes</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.actionButtons}>
                <Button
                    title="Share Family Code"
                    onPress={shareFamilyCode}
                    variant="outline"
                    size="large"
                    style={styles.shareButton}
                />
                <Button
                    title="Continue to Family Hub"
                    onPress={goToFamilyHub}
                    size="large"
                    style={styles.continueButton}
                />
            </View>
        </Animated.View>
    );

    // Always render the UI - don't wait for API calls
    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                {renderProgressIndicator()}

                {currentStep === 0 && renderFormStep()}
                {currentStep === 1 && renderSuccessStep()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    progressContainer: {
        marginBottom: spacing.xl,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        marginBottom: spacing.sm,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    stepContainer: {
        flex: 1,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    stepTitle: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    stepSubtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.lineHeights.md,
    },
    formCard: {
        marginBottom: spacing.lg,
    },
    descriptionContainer: {
        marginTop: spacing.md,
    },
    descriptionLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.text,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    characterCount: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    benefitsCard: {
        marginBottom: spacing.xl,
        backgroundColor: colors.primary + '05',
        borderColor: colors.primary + '20',
    },
    benefitsTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    benefitsList: {
        gap: spacing.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    benefitIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    benefitText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        flex: 1,
        lineHeight: typography.lineHeights.sm,
    },
    createButton: {
        marginBottom: spacing.md,
    },
    backButton: {
        alignSelf: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    backButtonText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    successHeader: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    successCheckmark: {
        fontSize: 32,
        color: colors.secondary,
        fontWeight: typography.weights.bold,
    },
    successTitle: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.lineHeights.md,
    },
    familyCodeCard: {
        marginBottom: spacing.lg,
        backgroundColor: colors.primary + '05',
        borderColor: colors.primary + '30',
        alignItems: 'center',
    },
    familyCodeTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    familyCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    familyCode: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
        letterSpacing: 2,
        marginRight: spacing.md,
    },
    copyIcon: {
        padding: spacing.xs,
    },
    familyCodeDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.lineHeights.sm,
    },
    nextStepsCard: {
        marginBottom: spacing.xl,
    },
    nextStepsTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    nextStepsList: {
        gap: spacing.md,
    },
    nextStepItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    stepNumberText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    nextStepText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        flex: 1,
        lineHeight: typography.lineHeights.sm,
    },
    actionButtons: {
        gap: spacing.md,
    },
    shareButton: {
        marginBottom: spacing.sm,
    },
    continueButton: {
        // Primary button styling handled by Button component
    },
});