import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: 'your-web-client-id.googleusercontent.com',
});

export const firebaseAuth = {
    // Email/Password authentication
    signUpWithEmail: async (email: string, password: string) => {
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },

    signInWithEmail: async (email: string, password: string) => {
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },

    // Password reset
    resetPassword: async (email: string) => {
        try {
            await auth().sendPasswordResetEmail(email);
        } catch (error) {
            throw error;
        }
    },

    // Google Sign-In
    signInWithGoogle: async () => {
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const userCredential = await auth().signInWithCredential(googleCredential);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await auth().signOut();
            await GoogleSignin.revokeAccess();
        } catch (error) {
            throw error;
        }
    },

    // Get current user
    getCurrentUser: () => {
        return auth().currentUser;
    },

    // Auth state listener
    onAuthStateChanged: (callback: (user: any) => void) => {
        return auth().onAuthStateChanged(callback);
    },
};