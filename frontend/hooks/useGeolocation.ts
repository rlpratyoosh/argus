import { useState, useEffect } from 'react';

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
      setLocation((prev) => ({ ...prev, error: "Geolocation is not supported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: undefined,
        });
      },
      (error) => {
        setLocation((prev) => ({ ...prev, error: "Could not get your location, try allowing location access in your browser settings." }));
      }
    );
  };

  return { location, getLocation };
};