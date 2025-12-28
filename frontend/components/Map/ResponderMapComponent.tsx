"use client";

import { Incident } from "@/types/incident";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const createIncidentIcon = (severity: string, status: string) => {
    // For resolved/closed incidents, use low severity icon (green-ish)
    // For in-progress, keep severity-based
    let iconPath = "/icons/medium.png";

    if (status === "RESOLVED" || status === "CLOSED") {
        iconPath = "/icons/low.png";
    } else {
        const iconMap: Record<string, string> = {
            LOW: "/icons/low.png",
            MEDIUM: "/icons/medium.png",
            HIGH: "/icons/high.png",
            CRITICAL: "/icons/critical.png",
        };
        iconPath = iconMap[severity] || iconMap.MEDIUM;
    }

    return L.icon({
        iconUrl: iconPath,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

interface MapProps {
    responderPos?: { lat: number; lng: number };
    incidents?: Incident[];
    selectedIncident?: Incident | null;
    onIncidentSelect?: (incident: Incident) => void;
}

function MapController({
    center,
    selectedIncident,
}: {
    center: { lat: number; lng: number };
    selectedIncident?: Incident | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (selectedIncident) {
            map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 16, { duration: 0.5 });
        } else if (center.lat !== 20.5937) {
            map.flyTo([center.lat, center.lng], 13, { duration: 0.5 });
        }
    }, [center, selectedIncident, map]);

    return null;
}

export default function ResponderMapComponent({
    responderPos,
    incidents = [],
    selectedIncident,
    onIncidentSelect,
}: MapProps) {
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    const center = responderPos || defaultCenter;

    return (
        <div className="absolute top-0 left-0 h-screen w-screen z-0">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={responderPos ? 13 : 5}
                zoomControl={false}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapController center={center} selectedIncident={selectedIncident} />

                {incidents.map(incident => (
                    <Marker
                        key={incident.id}
                        position={[incident.latitude, incident.longitude]}
                        icon={createIncidentIcon(incident.severity, incident.status)}
                        eventHandlers={{
                            click: () => onIncidentSelect?.(incident),
                        }}
                    >
                        <Popup>
                            <div className="text-black min-w-[150px]">
                                <h3 className="font-bold text-sm">{incident.title}</h3>
                                <p className="text-xs text-gray-600 mt-1">{incident.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded">
                                        {incident.status}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded">
                                        {incident.severity}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
