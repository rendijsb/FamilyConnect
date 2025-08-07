// src/screens/family/FamilyHubScreen.tsx - Fixed Family State Detection
import React, { useState, useEffect } from 'react';
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
import { GradientView } from '../../components/common/GradientView';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RootState, AppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';

const { width } = Dimensions.get('window');

export const FamilyHubScreen: React.FC = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { familyMembers } = useSelector((state: RootState) => state.user);

    const [refreshing, setRefreshing] = useState(false);
    const [familyData, setFamilyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        console.log('👨‍👩‍👧‍👦 Family Hub - User state:', {
            userId: user?.id,
            userName: user?.name,
            familyId: user?.familyId,
            role: user?.role
        });

        // Fetch fresh family data when component mounts
        fetchFamilyData();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    // Listen for user changes to update family state
    useEffect(() => {
        if (user?.familyId) {
            fetchFamilyData();
        }
    }, [user?.familyId]);

    const fetchFamilyData = async () => {
        if (!user?.familyId || !token) {
            console.log('📝 No family ID or token, showing create family state');
            setLoading(false);
            return;
        }

        try {
            console.log('🔄 Fetching family data for familyId:', user.familyId);

            // Fetch fresh user data to get family info
            const userResponse = await axios.get(
                'http://localhost:3000/api/auth/me',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { user: freshUser, family } = userResponse.data;
            console.log('📊 Fresh family data:', family);

            // Update Redux state with fresh user data
            dispatch(setCredentials({
                user: freshUser,
                token: token
            }));

            setFamilyData(family);
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('👤 User not in any family');
            }
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFamilyData();
        setRefreshing(false);
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
                navigation.navigate('FamilyMembers');
                break;
            default:
                Alert.alert('Coming Soon', 'This feature will be available soon!');
        }
    };

    const renderFamilyHeader = () => {
        const hasFamily = user?.familyId && familyData;

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
                            <Text style={styles.familyName}>{familyData.name}</Text>
                            <View style={styles.familyStats}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{familyData.members?.length || 0}</Text>
                                    <Text style={styles.statLabel}>Members</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{familyData.members?.filter((m: any) => m.id !== user.id).length || 0}</Text>
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
        const hasFamily = user?.familyId && familyData;

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
        const hasFamily = user?.familyId && familyData;

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
                        {[...familyData.members.slice(0, 6), { id: 'add', name: 'Add Member' }].map((member: any, index: number) => (
                            <TouchableOpacity key={member.id || index} style={styles.memberItem}>
                                {member.id === 'add' ? (
                                    <View style={[styles.memberAvatar, styles.addMemberAvatar]}>
                                        <Text style={styles.addMemberText}>+</Text>
                                    </View>
                                ) : (
                                    <View style={styles.memberAvatar}>
                                        <Text style={styles.memberInitial}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </Text>
                                        {member.id === user?.id && (
                                            <View style={[styles.onlineIndicator, { backgroundColor: colors.primary }]} />
                                        )}
                                    </View>
                                )}
                                <Text style={styles.memberName} numberOfLines={1}>
                                    {member.id === 'add' ? 'Add' : member.name.split(' ')[0]}
                                    {member.id === user?.id && ' (You)'}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
                                <Text style={styles.activityText}>Welcome to {familyData?.name || 'your family'}!</Text>
                                <Text style={styles.activityTime}>Just now</Text>
                            </View>
                        </View>
                        {user?.role === 'admin' && (
                            <View style={styles.activityItem}>
                                <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                                    <Icon name="person" size={16} color={colors.primary} />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityText}>You are the family admin</Text>
                                    <Text style={styles.activityTime}>You can invite and manage members</Text>
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading family data...</Text>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {renderFamilyHeader()}
                <View style={styles.content}>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
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