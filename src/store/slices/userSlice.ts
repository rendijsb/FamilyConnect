import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {User} from "./authSlice.ts";

interface UserPreferences {
    notifications: boolean;
    locationSharing: boolean;
    theme: 'light' | 'dark';
}

interface UserState {
    preferences: UserPreferences;
    familyMembers: User[];
}

const initialState: UserState = {
    preferences: {
        notifications: true,
        locationSharing: true,
        theme: 'light',
    },
    familyMembers: [],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
            state.preferences = { ...state.preferences, ...action.payload };
        },
        setFamilyMembers: (state, action: PayloadAction<User[]>) => {
            state.familyMembers = action.payload;
        },
    },
});

export const { updatePreferences, setFamilyMembers } = userSlice.actions;
export default userSlice.reducer;