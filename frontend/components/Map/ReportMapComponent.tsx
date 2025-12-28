"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents, Popup } from "react-leaflet";
import { Incident } from "@/types/incident"; // Make sure this path matches your project

const UserIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const IncidentIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

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
                        <Marker position={[pos.lat, pos.lng]} icon={UserIcon}>
                            <Popup>You are here</Popup>
                        </Marker>
                    </>
                )}

                {incidents.map((incident) => (
                    <Marker 
                        key={incident.id}
                        position={[incident.latitude, incident.longitude]} 
                        icon={IncidentIcon}
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