// src/navigation/MainNavigator.tsx - Enhanced with Better Family Navigation
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { Icon } from '../components/common/Icon';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { FamilyHubScreen } from '../screens/family/FamilyHubScreen';
import { CreateFamilyScreen } from '../screens/family/CreateFamilyScreen';
import { JoinFamilyScreen } from '../screens/family/JoinFamilyScreen';
import { FamilyMembersScreen } from '../screens/family/FamilyMembersScreen';
import { MainTabParamList, FamilyStackParamList } from './types';
import { RootState } from '../store';
import { colors, typography } from '../constants/theme';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();
const FamilyStack = createNativeStackNavigator<FamilyStackParamList>();

// Family Stack Navigator
const FamilyStackNavigator: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { familyData } = useSelector((state: RootState) => state.user);

    return (
        <FamilyStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.secondary,
                headerTitleStyle: {
                    fontWeight: typography.weights.bold,
                    fontSize: typography.sizes.lg,
                },
                animation: 'slide_from_right',
                animationDuration: 300,
            }}
        >
            <FamilyStack.Screen
                name="FamilyHub"
                component={FamilyHubScreen}
                options={{
                    title: user?.familyId && familyData ? familyData.name : 'Family Hub',
                    headerShown: false // FamilyHubScreen has its own header
                }}
            />
            <FamilyStack.Screen
                name="CreateFamily"
                component={CreateFamilyScreen}
                options={{
                    title: 'Create Family',
                    headerBackTitle: 'Back',
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <FamilyStack.Screen
                name="JoinFamily"
                component={JoinFamilyScreen}
                options={{
                    title: 'Join Family',
                    headerBackTitle: 'Back',
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <FamilyStack.Screen
                name="FamilyMembers"
                component={FamilyMembersScreen}
                options={{
                    title: 'Family Members',
                    headerBackTitle: 'Back',
                    headerShown: false // FamilyMembersScreen has its own header
                }}
            />
        </FamilyStack.Navigator>
    );
};

export const MainNavigator: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { familyData } = useSelector((state: RootState) => state.user);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'HomeTab':
                            iconName = 'home';
                            break;
                        case 'FamilyTab':
                            iconName = 'group';
                            break;
                        case 'ProfileTab':
                            iconName = 'person';
                            break;
                        default:
                            iconName = 'home';
                    }

                    return (
                        <Icon
                            name={iconName}
                            size={size}
                            color={color}
                            style={{
                                transform: [{ scale: focused ? 1.1 : 1 }],
                            }}
                        />
                    );
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                    paddingTop: 8,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    elevation: 8,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    marginTop: 2,
                },
                headerShown: false,
                tabBarHideOnKeyboard: Platform.OS === 'android',
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="FamilyTab"
                component={FamilyStackNavigator}
                options={{
                    title: user?.familyId && familyData ? familyData.name : 'Family',
                    tabBarLabel: 'Family',
                    tabBarBadge: user?.familyId ? undefined : '!',
                    tabBarBadgeStyle: {
                        backgroundColor: colors.accent,
                        color: colors.secondary,
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.bold,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        marginTop: -5,
                        marginLeft: 10,
                    },
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    title: user?.name?.split(' ')[0] || 'Profile',
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
};