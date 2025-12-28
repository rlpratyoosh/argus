"use client";

import MobileResponderStack from "@/components/MobileResponderStack";
import ResponderIncidentCard from "@/components/ResponderIncidentCard";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import api from "@/libs/axios";
import type { Incident } from "@/types/incident";
import { Filter, RefreshCw, Shield, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const ResponderMapComponent = dynamic(() => import("@/components/Map/ResponderMapComponent"), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    ),
});

type FilterStatus = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type FilterValidation = "ALL" | "PENDING" | "VALIDATED" | "REJECTED";

export default function RespondPage() {
    const { user, loading: authLoading } = useAuth();
    const { location, getLocation } = useGeolocation();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
    const [validationFilter, setValidationFilter] = useState<FilterValidation>("ALL");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        getLocation();
    }, [getLocation]);

    const fetchIncidents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get<Incident[]>("/incident");
            setIncidents(res.data);
        } catch (err: any) {
            console.error("Failed to fetch incidents", err);
            setError(err.response?.data?.message || "Failed to fetch incidents");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            fetchIncidents();
        }
    }, [authLoading, user, fetchIncidents]);

    useEffect(() => {
        if (!user?.city || !user?.state) return;

        const socket = io(process.env.NEXT_PUBLIC_API_URL || "", {
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("WebSocket connected");
        });

        const channel = `${user.city}-${user.state}`;
        socket.on(channel, (data: { message: string }) => {
            if (data.message === "new") {
                console.log("New incident notification received, refetching...");
                fetchIncidents();
            }
        });

        socket.on("disconnect", () => {
            console.log("WebSocket disconnected");
        });

        socket.on("connect_error", error => {
            console.error("WebSocket connection error:", error.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user?.city, user?.state, fetchIncidents]);

    const handleIncidentUpdate = (updatedIncident: Incident) => {
        setIncidents(prev => prev.map(inc => (inc.id === updatedIncident.id ? updatedIncident : inc)));
        if (selectedIncident?.id === updatedIncident.id) {
            setSelectedIncident(updatedIncident);
        }
    };

    const filteredIncidents = incidents.filter(inc => {
        if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
        if (validationFilter !== "ALL" && inc.validation !== validationFilter) return false;
        return true;
    });

    const stats = {
        total: incidents.length,
        open: incidents.filter(i => i.status === "OPEN").length,
        inProgress: incidents.filter(i => i.status === "IN_PROGRESS").length,
        pending: incidents.filter(i => i.validation === "PENDING").length,
    };

    if (authLoading) {
        return (
            <div className="w-screen h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen relative bg-black overflow-hidden">
            {/* Map Background */}
            <ResponderMapComponent
                responderPos={
                    location.latitude && location.longitude
                        ? { lat: location.latitude, lng: location.longitude }
                        : undefined
                }
                incidents={filteredIncidents}
                selectedIncident={selectedIncident}
                onIncidentSelect={setSelectedIncident}
            />

            {/* Desktop Sidebar */}
            <div className="hidden md:flex fixed top-6 left-6 bottom-6 w-[420px] flex-col z-10">
                <div className="flex flex-col h-full w-full rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">Responder Dashboard</h2>
                                    <p className="text-[10px] text-zinc-400">Managing your jurisdiction</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchIncidents}
                                disabled={loading}
                                className="p-2.5 rounded-xl bg-zinc-800/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </button>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-3">
                            <div className="flex-1 px-3 py-2 rounded-xl bg-zinc-800/40 border border-white/5">
                                <p className="text-lg font-bold text-white">{stats.total}</p>
                                <p className="text-[9px] text-zinc-500 uppercase font-semibold">Total</p>
                            </div>
                            <div className="flex-1 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <p className="text-lg font-bold text-blue-400">{stats.open}</p>
                                <p className="text-[9px] text-blue-400/60 uppercase font-semibold">Open</p>
                            </div>
                            <div className="flex-1 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                <p className="text-lg font-bold text-yellow-400">{stats.inProgress}</p>
                                <p className="text-[9px] text-yellow-400/60 uppercase font-semibold">Progress</p>
                            </div>
                            <div className="flex-1 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-lg font-bold text-amber-400">{stats.pending}</p>
                                <p className="text-[9px] text-amber-400/60 uppercase font-semibold">Pending</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-3 border-b border-white/5 bg-zinc-900/40">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    showFilters
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "bg-zinc-800/50 text-zinc-400 border border-white/5 hover:bg-zinc-700/50"
                                }`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Filters
                            </button>
                            {(statusFilter !== "ALL" || validationFilter !== "ALL") && (
                                <button
                                    onClick={() => {
                                        setStatusFilter("ALL");
                                        setValidationFilter("ALL");
                                    }}
                                    className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-[9px] text-zinc-500 uppercase font-bold mb-1.5 block">
                                        Status
                                    </label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as FilterStatus[]).map(
                                            s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStatusFilter(s)}
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                                        statusFilter === s
                                                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                            : "bg-zinc-800/50 text-zinc-500 border border-white/5 hover:bg-zinc-700/50"
                                                    }`}
                                                >
                                                    {s.replace("_", " ")}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] text-zinc-500 uppercase font-bold mb-1.5 block">
                                        Validation
                                    </label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(["ALL", "PENDING", "VALIDATED", "REJECTED"] as FilterValidation[]).map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setValidationFilter(v)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                                    validationFilter === v
                                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                        : "bg-zinc-800/50 text-zinc-500 border border-white/5 hover:bg-zinc-700/50"
                                                }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Incident List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <XCircle className="w-10 h-10 text-red-400 mb-3" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                                <button
                                    onClick={fetchIncidents}
                                    className="mt-3 px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredIncidents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                                <Shield className="w-12 h-12 text-zinc-600 mb-3" />
                                <p className="text-sm text-zinc-300 font-medium">No incidents found</p>
                                <p className="text-xs text-zinc-500">Try adjusting your filters</p>
                            </div>
                        ) : (
                            filteredIncidents.map(incident => (
                                <div
                                    key={incident.id}
                                    className={`transform transition hover:scale-[1.01] cursor-pointer ${
                                        selectedIncident?.id === incident.id
                                            ? "ring-2 ring-blue-500/50 rounded-2xl"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedIncident(incident)}
                                >
                                    <ResponderIncidentCard
                                        incident={incident}
                                        onUpdate={handleIncidentUpdate}
                                        onLocate={setSelectedIncident}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Stack */}
            <MobileResponderStack
                incidents={filteredIncidents}
                onIncidentUpdate={handleIncidentUpdate}
                onLocate={setSelectedIncident}
            />

            {/* Mobile Filter Button */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden fixed z-20 bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-md border transition-all duration-300 ${
                    showFilters
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                        : "bg-zinc-900/70 border-white/20 text-white shadow-lg shadow-blue-500/20"
                }`}
            >
                <Filter className="w-4 h-4" />
                <span className="font-bold text-sm">
                    {statusFilter !== "ALL" || validationFilter !== "ALL" ? "Filtered" : "Filter"}
                </span>
                {(statusFilter !== "ALL" || validationFilter !== "ALL") && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                )}
            </button>

            {/* Mobile Filter Panel */}
            {showFilters && (
                <div className="md:hidden fixed inset-x-0 bottom-0 z-40 animate-in slide-in-from-bottom duration-300">
                    <div className="mx-4 mb-20 p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-2 block">
                                    Status
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as FilterStatus[]).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setStatusFilter(s)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                statusFilter === s
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : "bg-zinc-800/50 text-zinc-500 border border-white/5"
                                            }`}
                                        >
                                            {s.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-2 block">
                                    Validation
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {(["ALL", "PENDING", "VALIDATED", "REJECTED"] as FilterValidation[]).map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setValidationFilter(v)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                validationFilter === v
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : "bg-zinc-800/50 text-zinc-500 border border-white/5"
                                            }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(statusFilter !== "ALL" || validationFilter !== "ALL") && (
                                <button
                                    onClick={() => {
                                        setStatusFilter("ALL");
                                        setValidationFilter("ALL");
                                    }}
                                    className="w-full py-2 rounded-xl bg-zinc-800/50 border border-white/5 text-zinc-400 text-xs font-semibold"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
