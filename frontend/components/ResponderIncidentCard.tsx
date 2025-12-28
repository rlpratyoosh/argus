"use client";

import api from "@/libs/axios";
import type { Incident } from "@/types/incident";
import { AlertTriangle, CheckCircle, Clock, MapPin, Shield, ThumbsUp, XCircle } from "lucide-react";
import { useState } from "react";

interface ResponderIncidentCardProps {
    incident: Incident;
    onUpdate?: (updatedIncident: Incident) => void;
}

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const validationOptions = ["PENDING", "VALIDATED", "REJECTED"] as const;

export default function ResponderIncidentCard({ incident, onUpdate }: ResponderIncidentCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(incident.status);
    const [currentValidation, setCurrentValidation] = useState(incident.validation);
    const [expanded, setExpanded] = useState(false);

    const handleStatusChange = async (newStatus: (typeof statusOptions)[number]) => {
        if (isUpdating || newStatus === currentStatus) return;

        setIsUpdating(true);
        try {
            await api.patch(`/incident/responder/${incident.id}`, { status: newStatus });
            setCurrentStatus(newStatus);
            onUpdate?.({ ...incident, status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleValidationChange = async (newValidation: (typeof validationOptions)[number]) => {
        if (isUpdating || newValidation === currentValidation) return;

        setIsUpdating(true);
        try {
            await api.patch(`/incident/responder/${incident.id}`, { validation: newValidation });
            setCurrentValidation(newValidation);
            onUpdate?.({ ...incident, validation: newValidation });
        } catch (err) {
            console.error("Failed to update validation", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const getSeverityStyle = (level: string) => {
        switch (level) {
            case "CRITICAL":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "HIGH":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            case "MEDIUM":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "LOW":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            default:
                return "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "OPEN":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "IN_PROGRESS":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "RESOLVED":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "CLOSED":
                return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
            default:
                return "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
        }
    };

    const getValidationStyle = (validation: string) => {
        switch (validation) {
            case "VALIDATED":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "REJECTED":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "PENDING":
            default:
                return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "OPEN":
                return <AlertTriangle className="w-3 h-3" />;
            case "IN_PROGRESS":
                return <Clock className="w-3 h-3" />;
            case "RESOLVED":
                return <CheckCircle className="w-3 h-3" />;
            case "CLOSED":
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    return (
        <div
            className={`group relative rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-white/5 
                       hover:bg-zinc-800/60 hover:border-white/10 transition-all duration-300 overflow-hidden
                       ${isUpdating ? "opacity-70 pointer-events-none" : ""}`}
        >
            <div className="p-4" onClick={() => setExpanded(!expanded)}>
                <div className="flex gap-3">
                    <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-zinc-800">
                        {incident.images.length > 0 ? (
                            <img src={incident.images[0]} alt={incident.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Shield className="w-8 h-8 text-zinc-600" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-bold text-white truncate">{incident.title}</h3>
                            <span
                                className={`shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-full border ${getSeverityStyle(
                                    incident.severity
                                )}`}
                            >
                                {incident.severity}
                            </span>
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{incident.description}</p>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusStyle(
                                    currentStatus
                                )}`}
                            >
                                {getStatusIcon(currentStatus)}
                                {currentStatus.replace("_", " ")}
                            </span>
                            <span
                                className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getValidationStyle(
                                    currentValidation
                                )}`}
                            >
                                {currentValidation}
                            </span>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" /> {incident.votes}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500">
                        {incident.city}, {incident.state}
                    </span>
                    <span className="text-[10px] text-zinc-600 ml-auto font-mono">
                        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                    </span>
                </div>
            </div>

            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4 animate-in slide-in-from-top-2 duration-200">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                            Validation
                        </label>
                        <div className="flex gap-2">
                            {validationOptions.map(v => (
                                <button
                                    key={v}
                                    onClick={() => handleValidationChange(v)}
                                    disabled={isUpdating}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200
                                        ${
                                            currentValidation === v
                                                ? getValidationStyle(v)
                                                : "bg-zinc-800/50 border-white/5 text-zinc-500 hover:bg-zinc-700/50"
                                        } disabled:opacity-50`}
                                >
                                    {v === "VALIDATED" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                    {v === "REJECTED" && <XCircle className="w-3 h-3 inline mr-1" />}
                                    {v === "PENDING" && <Clock className="w-3 h-3 inline mr-1" />}
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                            Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    disabled={isUpdating}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200
                                        ${
                                            currentStatus === s
                                                ? getStatusStyle(s)
                                                : "bg-zinc-800/50 border-white/5 text-zinc-500 hover:bg-zinc-700/50"
                                        } disabled:opacity-50`}
                                >
                                    {getStatusIcon(s)}
                                    <span className="ml-1">{s.replace("_", " ")}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
