"use client";

import IncidentCard from "@/components/IncidentCard";
import ReportMapComponent from "@/components/Map/ReportMapComponent";
import { useGeolocation } from "@/hooks/useGeolocation";
import api from "@/libs/axios";
import { Incident } from "@/types/incident";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReportPage() {
    const { location, getLocation } = useGeolocation();
    const [nearbyIncidents, setNearbyIncidents] = useState<Incident[]>([]);
    const [gotNoLocation, setGotNoLocation] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        getLocation();
    }, [getLocation]);

    useEffect(() => {
        if (location.latitude && location.longitude) {
            setGotNoLocation(false);
            const fetchNearbyIncidents = async () => {
                try {
                    const res = await api.get<Incident[]>("/incident/nearby", {
                        params: { latitude: location.latitude, longitude: location.longitude },
                    });
                    setNearbyIncidents(res.data);
                } catch (err) {
                    console.error("Failed to fetch nearby incidents", err);
                }
            };
            fetchNearbyIncidents();
        }
    }, [location]);

    return (
        <div className="w-screen h-screen relative bg-black overflow-hidden">
            {/* THE MAP LAYER */}
            <ReportMapComponent
                pos={
                    location.latitude && location.longitude
                        ? { lat: location.latitude, lng: location.longitude }
                        : undefined
                }
                incidents={nearbyIncidents}
            />

            <div className="hidden md:flex fixed top-6 left-6 bottom-6 w-96 flex-col z-10">
                {/* Glass Container */}
                <div className="flex flex-col h-full w-full rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-white/5 bg-linear-to-b from-white/5 to-transparent">
                        <h2 className="text-2xl font-semibold text-white tracking-tight">Nearby Incidents</h2>
                        <p className="text-xs text-zinc-400 mt-1">
                            {location.latitude ? "Live updates from your sector" : "Locating..."}
                        </p>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {nearbyIncidents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                                <span className="text-4xl mb-2">🛡️</span>
                                <p className="text-sm text-zinc-300">No active incidents nearby.</p>
                                <p className="text-xs text-zinc-500">Your area is secure.</p>
                            </div>
                        ) : (
                            nearbyIncidents.map(incident => (
                                // Ensure IncidentCard also has dark mode styles!
                                <div key={incident.id} className="transform transition hover:scale-[1.02]">
                                    <IncidentCard incident={incident} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => router.push("/report/new")}
                className="group fixed z-20 
               bottom-8 left-1/2 -translate-x-1/2 
               md:left-auto md:right-8 md:translate-x-0
               flex items-center justify-center gap-3 pl-5 pr-6 py-4
               rounded-full 
               /* Glassmorphism Base */
               bg-zinc-900/70 backdrop-blur-md
               border border-white/20
               text-white
               /* Glowing Shadow Effect */
               shadow-lg shadow-blue-500/20
               /* Hover States */
               hover:bg-zinc-800/80 hover:shadow-blue-500/40 hover:border-white/40
               /* Animation */
               transition-all duration-300 ease-out
               active:scale-95 w-60 "
            >
                <div className="relative flex items-center justify-center w-6 h-6">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white shadow-[0_0_15px_rgba(96,165,250,0.8)]"></span>
                </div>

                <span className="font-bold tracking-wide text-sm uppercase text-blue-50 group-hover:text-white transition-colors">
                    Report Incident
                </span>
            </button>
        </div>
    );
}
