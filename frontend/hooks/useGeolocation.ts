import { useCallback, useState } from "react";

type locationType = {
    latitude?: number;
    longitude?: number;
    error?: string;
};

// Cache location in memory for instant access across components
let cachedLocation: locationType = {
    latitude: undefined,
    longitude: undefined,
    error: undefined,
};

export const useGeolocation = () => {
    const [location, setLocation] = useState<locationType>(cachedLocation);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            const fallback = {
                latitude: 22.3,
                longitude: 73.2065,
                error: "Geolocation is not supported",
            };
            cachedLocation = fallback;
            setLocation(fallback);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: undefined,
                };
                cachedLocation = newLocation;
                setLocation(newLocation);
            },
            error => {
                const fallback = {
                    latitude: 22.3,
                    longitude: 73.2065,
                    error: "Could not get your location, try allowing location access in your browser settings.",
                };
                cachedLocation = fallback;
                setLocation(fallback);
            }
        );
    }, []);

    return { location, getLocation };
};
