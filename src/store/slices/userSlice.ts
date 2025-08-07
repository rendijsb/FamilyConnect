// src/store/slices/userSlice.ts - Enhanced with Family Management
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from "./authSlice";

interface UserPreferences {
    notifications: boolean;
    locationSharing: boolean;
    theme: 'light' | 'dark';
    language: string;
    autoBackup: boolean;
}

interface FamilyData {
    id: string;
    name: string;
    familyCode: string;
    createdAt: string;
    updatedAt: string;
    members: User[];
    memberCount: number;
    description?: string;
}

interface UserState {
    preferences: UserPreferences;
    familyMembers: User[];
    familyData: FamilyData | null;
    lastUpdated: string | null;
}

const initialState: UserState = {
    preferences: {
        notifications: true,
        locationSharing: true,
        theme: 'light',
        language: 'en',
        autoBackup: true,
    },
    familyMembers: [],
    familyData: null,
    lastUpdated: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
            state.preferences = { ...state.preferences, ...action.payload };
            state.lastUpdated = new Date().toISOString();
        },

        setFamilyMembers: (state, action: PayloadAction<User[]>) => {
            state.familyMembers = action.payload;
            state.lastUpdated = new Date().toISOString();
        },

        addFamilyMember: (state, action: PayloadAction<User>) => {
            const existingIndex = state.familyMembers.findIndex(member => member.id === action.payload.id);
            if (existingIndex >= 0) {
                state.familyMembers[existingIndex] = action.payload;
            } else {
                state.familyMembers.push(action.payload);
            }

            // Also update family data if it exists
            if (state.familyData) {
                const familyMemberIndex = state.familyData.members.findIndex(member => member.id === action.payload.id);
                if (familyMemberIndex >= 0) {
                    state.familyData.members[familyMemberIndex] = action.payload;
                } else {
                    state.familyData.members.push(action.payload);
                    state.familyData.memberCount = state.familyData.members.length;
                }
            }

            state.lastUpdated = new Date().toISOString();
        },

        removeFamilyMember: (state, action: PayloadAction<string>) => {
            state.familyMembers = state.familyMembers.filter(member => member.id !== action.payload);

            // Also update family data if it exists
            if (state.familyData) {
                state.familyData.members = state.familyData.members.filter(member => member.id !== action.payload);
                state.familyData.memberCount = state.familyData.members.length;
            }

            state.lastUpdated = new Date().toISOString();
        },

        setFamilyData: (state, action: PayloadAction<FamilyData | null>) => {
            state.familyData = action.payload;

            // Update family members list as well
            if (action.payload?.members) {
                state.familyMembers = action.payload.members;
            } else {
                state.familyMembers = [];
            }

            state.lastUpdated = new Date().toISOString();
        },

        updateFamilyData: (state, action: PayloadAction<Partial<FamilyData>>) => {
            if (state.familyData) {
                state.familyData = { ...state.familyData, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            }
        },

        clearFamilyData: (state) => {
            state.familyData = null;
            state.familyMembers = [];
            state.lastUpdated = new Date().toISOString();
        },

        resetUserState: (state) => {
            return initialState;
        },
    },
});

export const {
    updatePreferences,
    setFamilyMembers,
    addFamilyMember,
    removeFamilyMember,
    setFamilyData,
    updateFamilyData,
    clearFamilyData,
    resetUserState
} = userSlice.actions;

export default userSlice.reducer;