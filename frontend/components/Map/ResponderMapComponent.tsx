"use client";

import { Incident } from "@/types/incident";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const ResponderIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const getIncidentIcon = (severity: string, status: string) => {
    let color = "red";
    if (status === "RESOLVED" || status === "CLOSED") {
        color = "green";
    } else if (status === "IN_PROGRESS") {
        color = "gold";
    } else {
        switch (severity) {
            case "CRITICAL":
                color = "red";
                break;
            case "HIGH":
                color = "orange";
                break;
            case "MEDIUM":
                color = "gold";
                break;
            case "LOW":
                color = "green";
                break;
        }
    }

    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
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

                {responderPos && (
                    <Marker position={[responderPos.lat, responderPos.lng]} icon={ResponderIcon}>
                        <Popup>
                            <div className="text-black font-semibold">Your Location</div>
                        </Popup>
                    </Marker>
                )}

                {incidents.map(incident => (
                    <Marker
                        key={incident.id}
                        position={[incident.latitude, incident.longitude]}
                        icon={getIncidentIcon(incident.severity, incident.status)}
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
