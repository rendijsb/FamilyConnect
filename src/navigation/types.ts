// src/navigation/types.ts - Updated with Family Screens
export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type FamilyStackParamList = {
    FamilyHub: undefined;
    CreateFamily: undefined;
    JoinFamily: undefined;
    FamilyMembers: undefined;
};

export type MainTabParamList = {
    HomeTab: undefined;
    FamilyTab: undefined;
    ProfileTab: undefined;
};

export type RootStackParamList = {
    AuthStack: undefined;
    MainStack: undefined;
};

// Helper types for navigation props
export type FamilyScreenNavigationProp<T extends keyof FamilyStackParamList> = {
    navigation: {
        navigate: (screen: keyof FamilyStackParamList, params?: any) => void;
        goBack: () => void;
        canGoBack: () => boolean;
    };
};