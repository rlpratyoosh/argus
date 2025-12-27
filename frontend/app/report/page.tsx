"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect } from "react";

export default function ReportPage() {
    const { location, getLocation } = useGeolocation();

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <>
            {location.error && <div className="text-red-500">Error: {location.error}</div>}
            Your {location.latitude} and {location.longitude}
        </>
    )
}
