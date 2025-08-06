import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RootState, AppDispatch } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { familyMembers } = useSelector((state: RootState) => state.user);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        // Refresh family data, announcements, etc.
        setTimeout(() => setRefreshing(false), 2000);
    };

    const renderWelcomeCard = () => (
        <Card style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
                <View>
                    <Text style={styles.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0]}!</Text>
                    <Text style={styles.welcomeSubtitle}>
                        {user?.familyId ? 'Your family is staying connected' : 'Create or join a family to get started'}
                    </Text>
                </View>
                <View style={styles.welcomeIcon}>
                    <Icon name="home" size={32} color={colors.primary} />
                </View>
            </View>
        </Card>
    );

    const renderQuickActions = () => (
        <Card style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.quickAction}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                        <Icon name="location-on" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>Share Location</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.accent + '20' }]}>
                        <Icon name="attach-money" size={24} color={colors.accent} />
                    </View>
                    <Text style={styles.quickActionText}>Add Expense</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '20' }]}>
                        <Icon name="restaurant" size={24} color={colors.success} />
                    </View>
                    <Text style={styles.quickActionText}>Add Recipe</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
                        <Icon name="announcement" size={24} color={colors.warning} />
                    </View>
                    <Text style={styles.quickActionText}>Announce</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderFamilyOverview = () => (
        <Card style={styles.familyCard}>
            <View style={styles.familyHeader}>
                <Text style={styles.sectionTitle}>Family Overview</Text>
                <TouchableOpacity>
                    <Icon name="more-horiz" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {user?.familyId ? (
                <View>
                    <View style={styles.familyStats}>
                        <View style={styles.familyStat}>
                            <Text style={styles.familyStatNumber}>{familyMembers.length || 0}</Text>
                            <Text style={styles.familyStatLabel}>Members</Text>
                        </View>
                        <View style={styles.familyStat}>
                            <Text style={styles.familyStatNumber}>0</Text>
                            <Text style={styles.familyStatLabel}>Expenses</Text>
                        </View>
                        <View style={styles.familyStat}>
                            <Text style={styles.familyStatNumber}>0</Text>
                            <Text style={styles.familyStatLabel}>Recipes</Text>
                        </View>
                    </View>

                    <View style={styles.familyMembers}>
                        <Text style={styles.familyMembersTitle}>Active Members</Text>
                        {familyMembers.length > 0 ? (
                            familyMembers.slice(0, 3).map((member, index) => (
                                <View key={member.id} style={styles.familyMember}>
                                    <View style={styles.memberAvatar}>
                                        <Text style={styles.memberInitial}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.memberInfo}>
                                        <Text style={styles.memberName}>{member.name}</Text>
                                        <View style={styles.memberStatus}>
                                            <View style={styles.onlineIndicator} />
                                            <Text style={styles.memberStatusText}>Online</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noMembersText}>No family members yet</Text>
                        )}
                    </View>
                </View>
            ) : (
                <View style={styles.noFamilyContainer}>
                    <Icon name="group-add" size={48} color={colors.textSecondary} />
                    <Text style={styles.noFamilyTitle}>No Family Yet</Text>
                    <Text style={styles.noFamilySubtitle}>
                        Create a new family or join an existing one to start connecting
                    </Text>
                    <View style={styles.noFamilyButtons}>
                        <Button title="Create Family" size="small" style={styles.createFamilyButton}
                                onPress={function (): void {
                                    throw new Error('Function not implemented.');
                                }} />
                        <Button title="Join Family" variant="outline" size="small" onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }} />
                    </View>
                </View>
            )}
        </Card>
    );

    const renderRecentActivity = () => (
        <Card style={styles.activityCard}>
            <View style={styles.activityHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.activityList}>
                <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: colors.success + '20' }]}>
                        <Icon name="check-circle" size={16} color={colors.success} />
                    </View>
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>Welcome to FamilyConnect!</Text>
                        <Text style={styles.activityTime}>Just now</Text>
                    </View>
                </View>
            </View>
        </Card>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {renderWelcomeCard()}
            {renderQuickActions()}
            {renderFamilyOverview()}
            {renderRecentActivity()}
        </ScrollView>
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
    welcomeCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.primary + '10',
        borderColor: colors.primary + '20',
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    welcomeSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    welcomeIcon: {
        padding: spacing.sm,
    },
    quickActionsCard: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickAction: {
        width: '47%',
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.sm,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    quickActionText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        textAlign: 'center',
    },
    familyCard: {
        marginBottom: spacing.md,
    },
    familyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    familyStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.md,
    },
    familyStat: {
        alignItems: 'center',
    },
    familyStatNumber: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
    },
    familyStatLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    familyMembers: {
        marginTop: spacing.sm,
    },
    familyMembersTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    familyMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    memberAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    memberInitial: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    memberStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    onlineIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.success,
        marginRight: spacing.xs,
    },
    memberStatusText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
    noMembersText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
    noFamilyContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    noFamilyTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    noFamilySubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    noFamilyButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    createFamilyButton: {
        paddingHorizontal: spacing.lg,
    },
    activityCard: {
        marginBottom: spacing.md,
    },
    activityHeader: {
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
    activityList: {
        gap: spacing.sm,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    activityIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
    },
    activityTime: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});