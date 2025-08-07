// src/navigation/MainNavigator.tsx - Complete fix with navigation
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from '../components/common/Icon';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { FamilyHubScreen } from '../screens/family/FamilyHubScreen';
import { CreateFamilyScreen } from '../screens/family/CreateFamilyScreen';
import { JoinFamilyScreen } from '../screens/family/JoinFamilyScreen';
import { FamilyMembersScreen } from '../screens/family/FamilyMembersScreen';
import { MainTabParamList, FamilyStackParamList } from './types';
import { colors, typography } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const FamilyStack = createNativeStackNavigator<FamilyStackParamList>();

// Family Stack Navigator
const FamilyStackNavigator: React.FC = () => {
    return (
        <FamilyStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.secondary,
                headerTitleStyle: {
                    fontWeight: typography.weights.bold,
                },
            }}
        >
            <FamilyStack.Screen
                name="FamilyHub"
                component={FamilyHubScreen}
                options={{
                    title: 'Family Hub',
                    headerShown: false
                }}
            />
            <FamilyStack.Screen
                name="CreateFamily"
                component={CreateFamilyScreen}
                options={{
                    title: 'Create Family',
                    headerBackTitle: 'Back'
                }}
            />
            <FamilyStack.Screen
                name="JoinFamily"
                component={JoinFamilyScreen}
                options={{
                    title: 'Join Family',
                    headerBackTitle: 'Back'
                }}
            />
            <FamilyStack.Screen
                name="FamilyMembers"
                component={FamilyMembersScreen}
                options={{
                    title: 'Family Members',
                    headerBackTitle: 'Back',
                    headerShown: false
                }}
            />
        </FamilyStack.Navigator>
    );
};

export const MainNavigator: React.FC = () => {
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

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarLabelStyle: {
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    tabBarLabel: 'Home'
                }}
            />
            <Tab.Screen
                name="FamilyTab"
                component={FamilyStackNavigator}
                options={{
                    title: 'Family',
                    tabBarLabel: 'Family'
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarLabel: 'Profile'
                }}
            />
        </Tab.Navigator>
    );
};