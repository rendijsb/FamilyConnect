// src/screens/family/FamilyHubScreen.tsx - RESILIENT VERSION (No API Dependencies for Rendering)
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    RefreshControl,
    Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { GradientView } from '../../components/common/GradientView';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RootState, AppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { setFamilyData, setFamilyMembers } from '../../store/slices/userSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';

const { width } = Dimensions.get('window');

export const FamilyHubScreen: React.FC = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { familyData, familyMembers } = useSelector((state: RootState) => state.user);

    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fadeAnim = new Animated.Value(0);

    // Start animations immediately
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    // Fetch family data when screen comes into focus (optional)
    useFocusEffect(
        useCallback(() => {
            // Only fetch if we have the necessary data
            if (token && user) {
                fetchFamilyDataOptional();
            }
        }, [user?.familyId, token])
    );

    const fetchFamilyDataOptional = async (showLoader = false) => {
        if (showLoader) setRefreshing(true);
        setError(null);

        try {
            console.log('🔄 Attempting to fetch family data...');

            if (!token) {
                console.log('⚠️ No token available for family data fetch');
                return;
            }

            // Get fresh user data from server
            const userResponse = await axios.get(
                'http://localhost:3000/api/auth/me',
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 8000
                }
            );

            const { user: freshUser, family } = userResponse.data;
            console.log('📊 Fresh user data received:', {
                userId: freshUser.id,
                familyId: freshUser.familyId,
                familyName: family?.name
            });

            // Update Redux state with fresh user data
            dispatch(setCredentials({
                user: freshUser,
                token: token!
            }));

            if (family) {
                dispatch(setFamilyData(family));
                dispatch(setFamilyMembers(family.members || []));
                console.log('✅ Family data updated successfully');
            } else {
                dispatch(setFamilyData(null));
                dispatch(setFamilyMembers([]));
                console.log('📝 No family found for user');
            }

        } catch (error: any) {
            console.log('⚠️ Family data fetch failed (non-critical):', error.message);

            // Only show error for user-initiated refreshes
            if (showLoader) {
                let errorMessage = 'Unable to refresh family data';

                if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Connection timeout. Please try again.';
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    errorMessage = 'Network error. Check your connection.';
                } else if (error.response?.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                }

                setError(errorMessage);
            }
        } finally {
            if (showLoader) setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        await fetchFamilyDataOptional(true);
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'location':
                Alert.alert('Location Sharing', 'Location sharing will be available soon!');
                break;
            case 'expense':
                Alert.alert('Add Expense', 'Expense tracking will be available soon!');
                break;
            case 'recipe':
                Alert.alert('Add Recipe', 'Recipe sharing will be available soon!');
                break;
            case 'announce':
                Alert.alert('Announcement', 'Announcements will be available soon!');
                break;
            case 'invite':
                if (user?.familyId) {
                    navigation.navigate('FamilyMembers');
                } else {
                    Alert.alert('No Family', 'Please create or join a family first.');
                }
                break;
            default:
                Alert.alert('Coming Soon', 'This feature will be available soon!');
        }
    };

    const renderFamilyHeader = () => {
        // Use Redux state for family info (fallback to user data)
        const hasFamily = user?.familyId && (familyData || user.familyId);
        const displayFamilyName = familyData?.name || 'Your Family';
        const memberCount = familyData?.members?.length || familyMembers?.length || 1;

        return (
            <GradientView
                colors={[colors.primary, colors.primaryLight]}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Family Member'}</Text>
                        </View>
                        <TouchableOpacity style={styles.profileButton}>
                            <View style={styles.profileAvatar}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {hasFamily ? (
                        <View style={styles.familyInfo}>
                            <Text style={styles.familyName}>{displayFamilyName}</Text>
                            <View style={styles.familyStats}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{memberCount}</Text>
                                    <Text style={styles.statLabel}>Members</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{Math.max(0, memberCount - 1)}</Text>
                                    <Text style={styles.statLabel}>Others</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>0</Text>
                                    <Text style={styles.statLabel}>Events</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noFamilyHeader}>
                            <Text style={styles.noFamilyText}>Create or join a family to get started</Text>
                        </View>
                    )}
                </View>
            </GradientView>
        );
    };

    const renderQuickActions = () => {
        const hasFamily = user?.familyId && (familyData || user.familyId);

        return (
            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
                    {[
                        { icon: 'location-on', label: 'Share Location', color: colors.accent, action: 'location' },
                        { icon: 'attach-money', label: 'Split Bill', color: colors.success, action: 'expense' },
                        { icon: 'restaurant', label: 'Add Recipe', color: colors.warning, action: 'recipe' },
                        { icon: 'announcement', label: 'Announce', color: colors.primary, action: 'announce' },
                        ...(hasFamily ? [{ icon: 'group', label: 'Invite Member', color: colors.accent, action: 'invite' }] : []),
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickActionCard}
                            onPress={() => handleQuickAction(item.action)}
                        >
                            <GradientView
                                colors={[item.color, item.color + 'CC']}
                                style={styles.quickActionGradient}
                            >
                                <Icon name={item.icon} size={24} color={colors.secondary} />
                            </GradientView>
                            <Text style={styles.quickActionLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderFamilyMembers = () => {
        const hasFamily = user?.familyId && (familyData || user.familyId);
        const members = familyData?.members || familyMembers || [];

        return (
            <Card style={styles.membersCard}>
                <View style={styles.membersHeader}>
                    <Text style={styles.sectionTitle}>Family Members</Text>
                    {hasFamily && (
                        <TouchableOpacity onPress={() => navigation.navigate('FamilyMembers')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {hasFamily ? (
                    <View style={styles.membersGrid}>
                        {/* Show current user first */}
                        <TouchableOpacity style={styles.memberItem}>
                            <View style={styles.memberAvatar}>
                                <Text style={styles.memberInitial}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                                <View style={[styles.onlineIndicator, { backgroundColor: colors.primary }]} />
                            </View>
                            <Text style={styles.memberName} numberOfLines={1}>
                                {user?.name?.split(' ')[0] || 'You'} (You)
                            </Text>
                        </TouchableOpacity>

                        {/* Show other family members */}
                        {members.filter(m => m.id !== user?.id).slice(0, 4).map((member: any, index: number) => (
                            <TouchableOpacity key={member.id || index} style={styles.memberItem}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberInitial}>
                                        {member.name?.charAt(0).toUpperCase() || 'M'}
                                    </Text>
                                </View>
                                <Text style={styles.memberName} numberOfLines={1}>
                                    {member.name?.split(' ')[0] || 'Member'}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {/* Add member button */}
                        <TouchableOpacity
                            style={styles.memberItem}
                            onPress={() => handleQuickAction('invite')}
                        >
                            <View style={[styles.memberAvatar, styles.addMemberAvatar]}>
                                <Text style={styles.addMemberText}>+</Text>
                            </View>
                            <Text style={styles.memberName} numberOfLines={1}>Add</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.noMembersContainer}>
                        <Icon name="group-add" size={48} color={colors.textSecondary} />
                        <Text style={styles.noMembersTitle}>No Family Yet</Text>
                        <Text style={styles.noMembersSubtitle}>
                            Create a family or join an existing one to start connecting
                        </Text>
                        <View style={styles.familyButtons}>
                            <Button
                                title="Create Family"
                                onPress={() => navigation.navigate('CreateFamily')}
                                style={styles.createButton}
                                size="small"
                            />
                            <Button
                                title="Join Family"
                                variant="outline"
                                onPress={() => navigation.navigate('JoinFamily')}
                                size="small"
                            />
                        </View>
                    </View>
                )}
            </Card>
        );
    };

    const renderRecentActivity = () => (
        <Card style={styles.activityCard}>
            <View style={styles.activityHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity>
                    <Icon name="more-horiz" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.activityList}>
                {user?.familyId ? (
                    <>
                        <View style={styles.activityItem}>
                            <View style={[styles.activityIcon, { backgroundColor: colors.success + '20' }]}>
                                <Icon name="group" size={16} color={colors.success} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>
                                    Welcome to {familyData?.name || 'your family'}!
                                </Text>
                                <Text style={styles.activityTime}>Active family member</Text>
                            </View>
                        </View>
                        {user?.role === 'admin' && (
                            <View style={styles.activityItem}>
                                <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                                    <Icon name="person" size={16} color={colors.primary} />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityText}>You are the family admin</Text>
                                    <Text style={styles.activityTime}>Manage members and settings</Text>
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.activityItem}>
                        <View style={[styles.activityIcon, { backgroundColor: colors.accent + '20' }]}>
                            <Icon name="home" size={16} color={colors.accent} />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityText}>Welcome to FamilyConnect!</Text>
                            <Text style={styles.activityTime}>Create or join a family to start</Text>
                        </View>
                    </View>
                )}
            </View>
        </Card>
    );

    const renderErrorBanner = () => {
        if (!error) return null;

        return (
            <Card style={styles.errorCard}>
                <View style={styles.errorContent}>
                    <Icon name="error" size={20} color={colors.error} />
                    <View style={styles.errorTextContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            onPress={() => fetchFamilyDataOptional(true)}
                            style={styles.retryButton}
                        >
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        );
    };

    // Always render the UI - use fallback data from Redux state
    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {renderFamilyHeader()}
                <View style={styles.content}>
                    {renderErrorBanner()}
                    {renderQuickActions()}
                    {renderFamilyMembers()}
                    {renderRecentActivity()}
                </View>
            </ScrollView>
        </Animated.View>
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
        paddingBottom: spacing.xl,
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: borderRadius.xxl,
        borderBottomRightRadius: borderRadius.xxl,
    },
    headerContent: {
        paddingHorizontal: spacing.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: typography.sizes.md,
        color: colors.secondary + 'CC',
        marginBottom: spacing.xs,
    },
    userName: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    profileButton: {
        padding: spacing.xs,
    },
    profileAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: colors.secondary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.secondary + '30',
    },
    avatarText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    familyInfo: {
        backgroundColor: colors.secondary + '15',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    familyName: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    familyStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    statLabel: {
        fontSize: typography.sizes.sm,
        color: colors.secondary + 'CC',
        marginTop: spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.secondary + '30',
    },
    noFamilyHeader: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    noFamilyText: {
        color: colors.secondary + 'CC',
        fontSize: typography.sizes.md,
        textAlign: 'center',
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    errorCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.error + '10',
        borderColor: colors.error + '30',
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorTextContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    errorText: {
        fontSize: typography.sizes.sm,
        color: colors.error,
        marginBottom: spacing.xs,
    },
    retryButton: {
        alignSelf: 'flex-start',
    },
    retryText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    quickActionsContainer: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    quickActionsScroll: {
        marginHorizontal: -spacing.xs,
    },
    quickActionCard: {
        alignItems: 'center',
        marginHorizontal: spacing.xs,
        width: 80,
    },
    quickActionGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    quickActionLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 14,
    },
    membersCard: {
        marginBottom: spacing.lg,
    },
    membersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    viewAllText: {
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    memberItem: {
        alignItems: 'center',
        width: '30%',
        marginBottom: spacing.md,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
        position: 'relative',
    },
    memberInitial: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    addMemberAvatar: {
        backgroundColor: colors.border,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
    },
    addMemberText: {
        fontSize: typography.sizes.xl,
        color: colors.primary,
        fontWeight: typography.weights.bold,
    },
    memberName: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        textAlign: 'center',
    },
    noMembersContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    noMembersTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    noMembersSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: typography.lineHeights.sm,
    },
    familyButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    createButton: {
        paddingHorizontal: spacing.lg,
    },
    activityCard: {
        marginBottom: spacing.lg,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    activityList: {
        gap: spacing.sm,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    activityTime: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
});