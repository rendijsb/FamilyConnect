// src/screens/family/JoinFamilyScreen.tsx - Fixed Version
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    TextInput,
    Alert,
    Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import { GradientView } from '../../components/common/GradientView';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RootState } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';

interface JoinFamilyScreenProps {
    navigation: any;
}

export const JoinFamilyScreen: React.FC<JoinFamilyScreenProps> = ({ navigation }) => {
    const { user, token } = useSelector((state: RootState) => state.auth);

    const [familyCode, setFamilyCode] = useState(['', '', '', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [familyInfo, setFamilyInfo] = useState<any>(null);
    const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');

    const inputRefs = useRef<(TextInput | null)[]>([]);
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, [step]);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...familyCode];
        newCode[index] = text.toUpperCase();
        setFamilyCode(newCode);
        setError('');

        // Auto-focus next input
        if (text && index < 7 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-validate when complete
        if (newCode.every(char => char !== '') && newCode.join('').length === 8) {
            validateFamilyCode(newCode.join(''));
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !familyCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const validateFamilyCode = async (code: string) => {
        if (code.length !== 8) {
            setError('Family code must be 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Check if family exists (mock API call)
            const response = await axios.get(
                `http://localhost:3000/api/families/validate/${code}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFamilyInfo(response.data);
            setStep('preview');

        } catch (error: any) {
            if (error.response?.status === 404) {
                setError('Family not found. Please check your code.');
            } else {
                setError('Unable to validate family code. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const joinFamily = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:3000/api/families/join',
                { familyCode: familyCode.join('') },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStep('success');

        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to join family');
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    const renderCodeInput = () => (
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
            <View style={styles.headerSection}>
                <GradientView
                    colors={[colors.accent + '20', colors.primary + '10']}
                    style={styles.iconContainer}
                >
                    <Icon name="group" size={40} color={colors.accent} />
                </GradientView>

                <Text style={styles.stepTitle}>Join a Family</Text>
                <Text style={styles.stepSubtitle}>
                    Enter the 8-character family code to join an existing family
                </Text>
            </View>

            <Card style={styles.codeCard}>
                <Text style={styles.codeTitle}>Family Code</Text>

                <View style={styles.codeInputContainer}>
                    {familyCode.map((char, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {inputRefs.current[index] = ref}}
                            style={[
                                styles.codeInput,
                                char && styles.codeInputFilled,
                                error && styles.codeInputError,
                            ]}
                            value={char}
                            onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            maxLength={1}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            textAlign="center"
                            placeholder="•"
                            placeholderTextColor={colors.border}
                        />
                    ))}
                </View>

                {error ? (
                    <Animated.View style={styles.errorContainer}>
                        <Icon name="error" size={16} color={colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </Animated.View>
                ) : null}

                {loading && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Validating code...</Text>
                    </View>
                )}
            </Card>

            <Card style={styles.helpCard}>
                <Text style={styles.helpTitle}>Need help?</Text>
                <View style={styles.helpList}>
                    <View style={styles.helpItem}>
                        <Icon name="info" size={16} color={colors.primary} />
                        <Text style={styles.helpText}>Ask a family member for the 8-character code</Text>
                    </View>
                    <View style={styles.helpItem}>
                        <Icon name="info" size={16} color={colors.primary} />
                        <Text style={styles.helpText}>Codes are case-insensitive</Text>
                    </View>
                    <View style={styles.helpItem}>
                        <Icon name="info" size={16} color={colors.primary} />
                        <Text style={styles.helpText}>Create your own family if you don't have a code</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.createFamilyLink}
                    onPress={() => navigation.navigate('CreateFamily')}
                >
                    <Text style={styles.createFamilyText}>Create New Family Instead</Text>
                </TouchableOpacity>
            </Card>
        </Animated.View>
    );

    const renderFamilyPreview = () => (
        <Animated.View style={[
            styles.stepContainer,
            {
                opacity: fadeAnim,
                transform: [
                    {
                        scale: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.95, 1],
                        }),
                    },
                ],
            },
        ]}>
            <View style={styles.headerSection}>
                <View style={styles.familyAvatar}>
                    <Text style={styles.familyAvatarText}>
                        {familyInfo?.name?.charAt(0).toUpperCase() || 'F'}
                    </Text>
                </View>

                <Text style={styles.stepTitle}>Join "{familyInfo?.name}"?</Text>
                <Text style={styles.stepSubtitle}>
                    You're about to join this family group
                </Text>
            </View>

            <Card style={styles.previewCard}>
                <View style={styles.familyDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Family Name</Text>
                        <Text style={styles.detailValue}>{familyInfo?.name}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Members</Text>
                        <Text style={styles.detailValue}>{familyInfo?.memberCount || 0} members</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Created</Text>
                        <Text style={styles.detailValue}>
                            {new Date(familyInfo?.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.membersList}>
                    <Text style={styles.membersTitle}>Current Members</Text>
                    <View style={styles.membersGrid}>
                        {(familyInfo?.members || []).slice(0, 4).map((member: any, index: number) => (
                            <View key={member.id} style={styles.memberItem}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberInitial}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.memberName}>{member.name.split(' ')[0]}</Text>
                            </View>
                        ))}
                        {(familyInfo?.memberCount || 0) > 4 && (
                            <View style={styles.memberItem}>
                                <View style={[styles.memberAvatar, styles.moreMembersAvatar]}>
                                    <Text style={styles.moreMembersText}>
                                        +{(familyInfo?.memberCount || 0) - 4}
                                    </Text>
                                </View>
                                <Text style={styles.memberName}>More</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Card>

            <View style={styles.actionButtons}>
                <Button
                    title="Go Back"
                    variant="outline"
                    onPress={() => setStep('input')}
                    size="large"
                    style={styles.backButton}
                />
                <Button
                    title="Join Family"
                    onPress={joinFamily}
                    loading={loading}
                    size="large"
                    style={styles.joinButton}
                />
            </View>
        </Animated.View>
    );

    const renderSuccess = () => (
        <Animated.View style={[
            styles.stepContainer,
            {
                opacity: fadeAnim,
                transform: [
                    {
                        translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
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

                <Text style={styles.successTitle}>Welcome to the Family!</Text>
                <Text style={styles.successSubtitle}>
                    You've successfully joined "{familyInfo?.name}"
                </Text>
            </View>

            <Card style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>You're now part of:</Text>
                <Text style={styles.familyNameLarge}>{familyInfo?.name}</Text>
                <Text style={styles.welcomeDescription}>
                    Start connecting with your family members through location sharing,
                    expense tracking, and more.
                </Text>
            </Card>

            <Button
                title="Go to Family Hub"
                onPress={() => navigation.navigate('FamilyHub')}
                size="large"
                style={styles.continueButton}
            />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {step === 'input' && renderCodeInput()}
                {step === 'preview' && renderFamilyPreview()}
                {step === 'success' && renderSuccess()}
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
        paddingHorizontal: spacing.md,
    },
    codeCard: {
        marginBottom: spacing.lg,
        paddingVertical: spacing.xl,
    },
    codeTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    codeInput: {
        width: 35,
        height: 50,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        backgroundColor: colors.surface,
        textAlign: 'center',
    },
    codeInputFilled: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    codeInputError: {
        borderColor: colors.error,
        backgroundColor: colors.error + '10',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
    },
    errorText: {
        fontSize: typography.sizes.sm,
        color: colors.error,
        marginLeft: spacing.sm,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    loadingText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    helpCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
    },
    helpTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    helpList: {
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    helpText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
        flex: 1,
        lineHeight: typography.lineHeights.sm,
    },
    createFamilyLink: {
        alignSelf: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary + '10',
    },
    createFamilyText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    familyAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    familyAvatarText: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    previewCard: {
        marginBottom: spacing.xl,
    },
    familyDetails: {
        marginBottom: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    detailLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
    },
    detailValue: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        fontWeight: typography.weights.medium,
    },
    membersList: {
        alignItems: 'center',
    },
    membersTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    membersGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    memberItem: {
        alignItems: 'center',
        width: 60,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    memberInitial: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    memberName: {
        fontSize: typography.sizes.xs,
        color: colors.text,
        textAlign: 'center',
    },
    moreMembersAvatar: {
        backgroundColor: colors.textSecondary,
    },
    moreMembersText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    backButton: {
        flex: 1,
    },
    joinButton: {
        flex: 2,
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
    welcomeCard: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        backgroundColor: colors.success + '10',
        borderColor: colors.success + '30',
    },
    welcomeTitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    familyNameLarge: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    welcomeDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.lineHeights.sm,
    },
    continueButton: {
        marginTop: spacing.md,
    },
});