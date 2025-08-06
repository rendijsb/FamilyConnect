// src/services/permissions.ts
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

export const locationService = {
    // Request location permission
    requestLocationPermission: async (): Promise<boolean> => {
        try {
            let permission: Permission;

            if (Platform.OS === 'ios') {
                permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
            } else {
                permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
            }

            const result = await request(permission);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.error('Location permission error:', error);
            return false;
        }
    },

    // Check location permission status
    checkLocationPermission: async (): Promise<boolean> => {
        try {
            let permission: Permission;

            if (Platform.OS === 'ios') {
                permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
            } else {
                permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
            }

            const result = await check(permission);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.error('Location permission check error:', error);
            return false;
        }
    },

    // Get current location
    getCurrentLocation: (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        });
    },

    // Watch location changes
    watchLocation: (callback: (position: { latitude: number; longitude: number }) => void) => {
        return Geolocation.watchPosition(
            (position) => {
                callback({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Location watch error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000,
                distanceFilter: 10, // Update every 10 meters
            }
        );
    },
};