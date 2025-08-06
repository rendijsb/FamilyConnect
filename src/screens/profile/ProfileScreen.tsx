import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { updatePreferences } from '../../store/slices/userSlice';
import {borderRadius, colors, spacing, typography} from '../../constants/theme';

export const ProfileScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { preferences } = useSelector((state: RootState) => state.user);

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
    });

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => dispatch(logoutUser())
                },
            ]
        );
    };

    const handleSaveProfile = () => {
        // TODO: Implement profile update API call
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
    };

    const renderProfileHeader = () => (
        <Card style={profileStyles.profileCard}>
            <View style={profileStyles.profileHeader}>
                <View style={profileStyles.avatar}>
                    <Text style={profileStyles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <View style={profileStyles.profileInfo}>
                    <Text style={profileStyles.profileName}>{user?.name || 'User'}</Text>
                    <Text style={profileStyles.profileEmail}>{user?.email}</Text>
                    {user?.familyId && (
                        <View style={profileStyles.familyBadge}>
                            <Icon name="group" size={14} color={colors.primary} />
                            <Text style={profileStyles.familyBadgeText}>Family Member</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => setIsEditing(!isEditing)}
                    style={profileStyles.editButton}
                >
                    <Icon name={isEditing ? 'close' : 'edit'} size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderProfileForm = () => (
        <Card style={profileStyles.formCard}>
            <Text style={profileStyles.sectionTitle}>Personal Information</Text>

            <Input
                label="Full Name"
                value={profileData.name}
                onChangeText={(name) => setProfileData({ ...profileData, name })}
                editable={isEditing}
                leftIcon="person"
            />

            <Input
                label="Email"
                value={profileData.email}
                editable={false}
                leftIcon="email"
                style={profileStyles.disabledInput}
            />

            <Input
                label="Phone"
                value={profileData.phone}
                onChangeText={(phone) => setProfileData({ ...profileData, phone })}
                editable={isEditing}
                leftIcon="phone"
                keyboardType="phone-pad"
            />

            {isEditing && (
                <View style={profileStyles.formButtons}>
                    <Button
                        title="Save Changes"
                        onPress={handleSaveProfile}
                        style={profileStyles.saveButton}
                    />
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => {
                            setIsEditing(false);
                            setProfileData({
                                name: user?.name || '',
                                phone: user?.phone || '',
                                email: user?.email || '',
                            });
                        }}
                    />
                </View>
            )}
        </Card>
    );

    const renderPreferences = () => (
        <Card style={profileStyles.preferencesCard}>
            <Text style={profileStyles.sectionTitle}>Preferences</Text>

            <View style={profileStyles.preferenceItem}>
                <View style={profileStyles.preferenceInfo}>
                    <Icon name="notifications" size={20} color={colors.primary} />
                    <View style={profileStyles.preferenceText}>
                        <Text style={profileStyles.preferenceTitle}>Push Notifications</Text>
                        <Text style={profileStyles.preferenceSubtitle}>Get notified about family activities</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        profileStyles.toggle,
                        preferences.notifications && profileStyles.toggleActive
                    ]}
                    onPress={() => dispatch(updatePreferences({ notifications: !preferences.notifications }))}
                >
                    <View style={[
                        profileStyles.toggleCircle,
                        preferences.notifications && profileStyles.toggleCircleActive
                    ]} />
                </TouchableOpacity>
            </View>

            <View style={profileStyles.preferenceItem}>
                <View style={profileStyles.preferenceInfo}>
                    <Icon name="location-on" size={20} color={colors.primary} />
                    <View style={profileStyles.preferenceText}>
                        <Text style={profileStyles.preferenceTitle}>Location Sharing</Text>
                        <Text style={profileStyles.preferenceSubtitle}>Share your location with family</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        profileStyles.toggle,
                        preferences.locationSharing && profileStyles.toggleActive
                    ]}
                    onPress={() => dispatch(updatePreferences({ locationSharing: !preferences.locationSharing }))}
                >
                    <View style={[
                        profileStyles.toggleCircle,
                        preferences.locationSharing && profileStyles.toggleCircleActive
                    ]} />
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderActions = () => (
        <Card style={profileStyles.actionsCard}>
            <Text style={profileStyles.sectionTitle}>Account</Text>

            <TouchableOpacity style={profileStyles.actionItem}>
                <Icon name="security" size={20} color={colors.textSecondary} />
                <Text style={profileStyles.actionText}>Privacy & Security</Text>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={profileStyles.actionItem}>
                <Icon name="help" size={20} color={colors.textSecondary} />
                <Text style={profileStyles.actionText}>Help & Support</Text>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={profileStyles.actionItem}>
                <Icon name="info" size={20} color={colors.textSecondary} />
                <Text style={profileStyles.actionText}>About</Text>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[profileStyles.actionItem, profileStyles.logoutItem]} onPress={handleLogout}>
                <Icon name="logout" size={20} color={colors.error} />
                <Text style={[profileStyles.actionText, profileStyles.logoutText]}>Sign Out</Text>
            </TouchableOpacity>
        </Card>
    );

    return (
        <ScrollView style={profileStyles.container} contentContainerStyle={profileStyles.scrollContent}>
            {renderProfileHeader()}
            {renderProfileForm()}
            {renderPreferences()}
            {renderActions()}
        </ScrollView>
    );
};

const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    profileCard: {
        marginBottom: spacing.md,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.secondary,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    profileEmail: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    familyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    familyBadgeText: {
        fontSize: typography.sizes.xs,
        color: colors.primary,
        marginLeft: spacing.xs,
        fontWeight: typography.weights.medium,
    },
    editButton: {
        padding: spacing.sm,
    },
    formCard: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    disabledInput: {
        opacity: 0.6,
    },
    formButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    saveButton: {
        flex: 1,
    },
    preferencesCard: {
        marginBottom: spacing.md,
    },
    preferenceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.sm,
    },
    preferenceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    preferenceText: {
        marginLeft: spacing.md,
        flex: 1,
    },
    preferenceTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    preferenceSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.border,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleActive: {
        backgroundColor: colors.primary,
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.secondary,
        alignSelf: 'flex-start',
    },
    toggleCircleActive: {
        alignSelf: 'flex-end',
    },
    actionsCard: {
        marginBottom: spacing.md,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    actionText: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.text,
        marginLeft: spacing.md,
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: colors.error,
    },
});