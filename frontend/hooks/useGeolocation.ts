import { useState } from "react";

type locationType = {
    latitude?: number;
    longitude?: number;
    error?: string;
};

export const useGeolocation = () => {
    const [location, setLocation] = useState<locationType>({
        latitude: undefined,
        longitude: undefined,
        error: undefined,
    });

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocation({
                latitude: 22.3,
                longitude: 73.2065,
                error: "Geolocation is not supported",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: undefined,
                });
            },
            error => {
                setLocation({
                    latitude: 22.3,
                    longitude: 73.2065,
                    error: "Could not get your location, try allowing location access in your browser settings.",
                });
            }
        );
    };

    return { location, getLocation };
};
