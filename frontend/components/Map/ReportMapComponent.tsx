"use client";

import { Incident } from "@/types/incident"; // Make sure this path matches your project
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

const createUserIcon = () =>
    L.icon({
        iconUrl: "/icons/user.png",
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
    });

const createSeverityIcon = (severity: string) => {
    const iconMap: Record<string, string> = {
        LOW: "/icons/low.png",
        MEDIUM: "/icons/medium.png",
        HIGH: "/icons/high.png",
        CRITICAL: "/icons/critical.png",
    };

    return L.icon({
        iconUrl: iconMap[severity] || iconMap.MEDIUM,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

interface MapProps {
    pos?: { lat: number; lng: number };
    incidents?: Incident[];
}

function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
    const map = useMapEvents({});
    useEffect(() => {
        map.flyTo([center.lat, center.lng], 15);
    }, [center, map]);
    return null;
}

export default function ReportMapComponent({ pos, incidents = [] }: MapProps) {
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    const center = pos || defaultCenter;

    const userIcon = useMemo(() => createUserIcon(), []);

    return (
        <div className="absolute top-0 left-0 h-screen w-screen z-0">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={pos ? 15 : 5}
                zoomControl={false}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {pos && (
                    <>
                        <MapUpdater center={pos} />
                        <Marker position={[pos.lat, pos.lng]} icon={userIcon} zIndexOffset={1000}>
                            <Popup>You are here</Popup>
                        </Marker>
                    </>
                )}

                {incidents.map(incident => (
                    <Marker
                        key={incident.id}
                        position={[incident.latitude, incident.longitude]}
                        icon={createSeverityIcon(incident.severity)}
                    >
                        <Popup>
                            <div className="text-black">
                                <h3 className="font-bold">{incident.title}</h3>
                                <p className="text-sm">{incident.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
