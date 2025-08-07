import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
    Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RootState } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { GradientView } from '../../components/common/GradientView';

interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'member';
    avatarUrl?: string;
    lastSeen?: string;
    isOnline: boolean;
    joinedAt: string;
    location?: {
        address: string;
        updatedAt: string;
    };
}

interface FamilyMembersScreenProps {
    navigation: any;
}

export const FamilyMembersScreen: React.FC<FamilyMembersScreenProps> = ({ navigation }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { familyMembers } = useSelector((state: RootState) => state.user);

    const [members, setMembers] = useState<Member[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        // Mock data - replace with actual API call
        const mockMembers: Member[] = [
            {
                id: '1',
                name: 'John Smith',
                email: 'john@example.com',
                phone: '+1 234 567 8900',
                role: 'admin',
                isOnline: true,
                joinedAt: '2024-01-15',
                location: {
                    address: 'Downtown Office',
                    updatedAt: '2 minutes ago'
                }
            },
            {
                id: '2',
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                role: 'member',
                isOnline: true,
                joinedAt: '2024-01-20',
                lastSeen: '5 minutes ago',
                location: {
                    address: 'Home',
                    updatedAt: '10 minutes ago'
                }
            },
            {
                id: '3',
                name: 'Mike Wilson',
                email: 'mike@example.com',
                role: 'member',
                isOnline: false,
                joinedAt: '2024-02-01',
                lastSeen: '2 hours ago'
            }
        ];

        setMembers(mockMembers);

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate API refresh
        setTimeout(() => setRefreshing(false), 1500);
    };

    const handleInviteMember = () => {
        setShowInviteModal(true);
    };

    const sendInvitation = async () => {
        if (!inviteEmail.trim()) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }

        setLoading(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert(
                'Invitation Sent!',
                `An invitation has been sent to ${inviteEmail}`,
                [{ text: 'OK', onPress: () => setShowInviteModal(false) }]
            );
            setInviteEmail('');
        } catch (error) {
            Alert.alert('Error', 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleMemberPress = (member: Member) => {
        setSelectedMember(member);
        setShowMemberModal(true);
    };

    const handleRemoveMember = (memberId: string) => {
        Alert.alert(
            'Remove Member',
            'Are you sure you want to remove this member from the family?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setMembers(prev => prev.filter(m => m.id !== memberId));
                        setShowMemberModal(false);
                    }
                }
            ]
        );
    };

    const renderFamilyHeader = () => (
        <GradientView
            colors={[colors.primary, colors.primaryLight]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.headerContent}>
                <View style={styles.headerStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{members.length}</Text>
                        <Text style={styles.statLabel}>Total Members</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{members.filter(m => m.isOnline).length}</Text>
                        <Text style={styles.statLabel}>Online Now</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{members.filter(m => m.role === 'admin').length}</Text>
                        <Text style={styles.statLabel}>Admins</Text>
                    </View>
                </View>

                <Button
                    title="Invite Member"
                    onPress={handleInviteMember}
                    variant="secondary"
                    size="small"
                    style={styles.inviteButton}
                />
            </View>
        </GradientView>
    );

    const renderMemberCard = (member: Member) => (
        <TouchableOpacity key={member.id} onPress={() => handleMemberPress(member)}>
            <Card style={styles.memberCard}>
                <View style={styles.memberHeader}>
                    <View style={styles.memberInfo}>
                        <View style={styles.memberAvatarContainer}>
                            <View style={styles.memberAvatar}>
                                <Text style={styles.memberInitial}>
                                    {member.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={[
                                styles.onlineIndicator,
                                { backgroundColor: member.isOnline ? colors.success : colors.textSecondary }
                            ]} />
                        </View>

                        <View style={styles.memberDetails}>
                            <View style={styles.memberNameRow}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                {member.role === 'admin' && (
                                    <View style={styles.adminBadge}>
                                        <Text style={styles.adminBadgeText}>Admin</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                            <View style={styles.memberStatus}>
                                <Text style={[
                                    styles.statusText,
                                    { color: member.isOnline ? colors.success : colors.textSecondary }
                                ]}>
                                    {member.isOnline ? 'Online' : `Last seen ${member.lastSeen}`}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Icon name="chevron-right" size={16} color={colors.textSecondary} />
                </View>

                {member.location && (
                    <View style={styles.locationSection}>
                        <Icon name="location-on" size={14} color={colors.accent} />
                        <Text style={styles.locationText}>
                            {member.location.address} • {member.location.updatedAt}
                        </Text>
                    </View>
                )}
            </Card>
        </TouchableOpacity>
    );

    const renderInviteModal = () => (
        <Modal
            visible={showInviteModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowInviteModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                        <Icon name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Invite Member</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.modalContent}>
                    <Card style={styles.inviteCard}>
                        <Text style={styles.inviteTitle}>Send Family Invitation</Text>
                        <Text style={styles.inviteDescription}>
                            Enter the email address of the person you'd like to invite to your family.
                        </Text>

                        <Input
                            label="Email Address"
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            placeholder="Enter email address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="email"
                        />

                        <Button
                            title="Send Invitation"
                            onPress={sendInvitation}
                            loading={loading}
                            size="large"
                            style={styles.sendButton}
                        />
                    </Card>

                    <Card style={styles.alternativeCard}>
                        <Text style={styles.alternativeTitle}>Or share family code</Text>
                        <Text style={styles.alternativeDescription}>
                            Share your family code with others so they can join directly.
                        </Text>

                        <TouchableOpacity style={styles.familyCodeContainer}>
                            <Text style={styles.familyCode}>ABC12XYZ</Text>
                            <Icon name="copy" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </Card>
                </ScrollView>
            </View>
        </Modal>
    );

    const renderMemberModal = () => (
        <Modal
            visible={showMemberModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowMemberModal(false)}
        >
            {selectedMember && (
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                            <Icon name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Member Details</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Card style={styles.memberDetailCard}>
                            <View style={styles.memberDetailHeader}>
                                <View style={styles.memberAvatarLarge}>
                                    <Text style={styles.memberInitialLarge}>
                                        {selectedMember.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>

                                <Text style={styles.memberNameLarge}>{selectedMember.name}</Text>
                                <Text style={styles.memberEmailLarge}>{selectedMember.email}</Text>

                                <View style={styles.memberBadges}>
                                    {selectedMember.role === 'admin' && (
                                        <View style={styles.adminBadgeLarge}>
                                            <Text style={styles.adminBadgeTextLarge}>Admin</Text>
                                        </View>
                                    )}
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: selectedMember.isOnline ? colors.success : colors.textSecondary }
                                    ]}>
                                        <Text style={styles.statusBadgeText}>
                                            {selectedMember.isOnline ? 'Online' : 'Offline'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.memberInfoGrid}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Phone</Text>
                                    <Text style={styles.infoValue}>{selectedMember.phone || 'Not provided'}</Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Joined</Text>
                                    <Text style={styles.infoValue}>
                                        {new Date(selectedMember.joinedAt).toLocaleDateString()}
                                    </Text>
                                </View>

                                {selectedMember.location && (
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Last Location</Text>
                                        <Text style={styles.infoValue}>
                                            {selectedMember.location.address}
                                        </Text>
                                        <Text style={styles.infoSubvalue}>
                                            Updated {selectedMember.location.updatedAt}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Card>

                        {user?.role === 'admin' && selectedMember.id !== user.id && (
                            <Card style={styles.adminActionsCard}>
                                <Text style={styles.adminActionsTitle}>Admin Actions</Text>

                                <TouchableOpacity style={styles.actionButton}>
                                    <Icon name="person" size={20} color={colors.primary} />
                                    <Text style={styles.actionButtonText}>Change Role</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.dangerButton]}
                                    onPress={() => handleRemoveMember(selectedMember.id)}
                                >
                                    <Icon name="remove" size={20} color={colors.error} />
                                    <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                                        Remove from Family
                                    </Text>
                                </TouchableOpacity>
                            </Card>
                        )}
                    </ScrollView>
                </View>
            )}
        </Modal>
    );

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {renderFamilyHeader()}

                <View style={styles.membersContainer}>
                    <Text style={styles.sectionTitle}>Family Members</Text>
                    {members.map(renderMemberCard)}
                </View>
            </ScrollView>

            {renderInviteModal()}
            {renderMemberModal()}
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
        alignItems: 'center',
    },
    headerStats: {
        flexDirection: 'row',
        backgroundColor: colors.secondary + '15',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        width: '100%',
        justifyContent: 'space-around',
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
    inviteButton: {
        paddingHorizontal: spacing.xl,
    },
    membersContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    memberCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    memberAvatarContainer: {
        position: 'relative',
        marginRight: spacing.md,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
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
    memberDetails: {
        flex: 1,
    },
    memberNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    memberName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginRight: spacing.sm,
    },
    adminBadge: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: borderRadius.sm,
    },
    adminBadgeText: {
        fontSize: typography.sizes.xs,
        color: colors.secondary,
        fontWeight: typography.weights.bold,
    },
    memberEmail: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    memberStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
    },
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    locationText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingTop: 50,
    },
    modalTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    modalContent: {
        flex: 1,
        padding: spacing.lg,
    },
    inviteCard: {
        marginBottom: spacing.lg,
    },
    inviteTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    inviteDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        lineHeight: typography.lineHeights.sm,
    },
    sendButton: {
        marginTop: spacing.md,
    },
    alternativeCard: {
        alignItems: 'center',
        backgroundColor: colors.primary + '05',
        borderColor: colors.primary + '20',
    },
    alternativeTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    alternativeDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: typography.lineHeights.sm,
    },
    familyCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    familyCode: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.primary,
        letterSpacing: 2,
        marginRight: spacing.md,
    },
    memberDetailCard: {
        marginBottom: spacing.lg,
    },
    memberDetailHeader: {
        alignItems: 'center',
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.lg,
    },
    memberAvatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    memberInitialLarge: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    memberNameLarge: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    memberEmailLarge: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    memberBadges: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    adminBadgeLarge: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    adminBadgeTextLarge: {
        fontSize: typography.sizes.sm,
        color: colors.secondary,
        fontWeight: typography.weights.bold,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    statusBadgeText: {
        fontSize: typography.sizes.sm,
        color: colors.secondary,
        fontWeight: typography.weights.medium,
    },
    memberInfoGrid: {
        gap: spacing.md,
    },
    infoItem: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
        marginBottom: spacing.xs,
    },
    infoValue: {
        fontSize: typography.sizes.md,
        color: colors.text,
        fontWeight: typography.weights.medium,
    },
    infoSubvalue: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    adminActionsCard: {
        borderColor: colors.warning + '30',
        backgroundColor: colors.warning + '05',
    },
    adminActionsTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    actionButtonText: {
        fontSize: typography.sizes.md,
        color: colors.text,
        marginLeft: spacing.md,
        fontWeight: typography.weights.medium,
    },
    dangerButton: {
        backgroundColor: colors.error + '10',
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    dangerButtonText: {
        color: colors.error,
    },
});