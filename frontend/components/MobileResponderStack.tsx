"use client";

import type { Incident } from "@/types/incident";
import { AlertTriangle, CheckCircle, ChevronUp, Clock, Shield, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ResponderIncidentCard from "./ResponderIncidentCard";

interface MobileResponderStackProps {
    incidents: Incident[];
    onIncidentUpdate?: (updatedIncident: Incident) => void;
}

function getSeverityColor(level: string) {
    switch (level) {
        case "CRITICAL":
            return "bg-red-500/20 border-red-500/40 text-red-400";
        case "HIGH":
            return "bg-orange-500/20 border-orange-500/40 text-orange-400";
        case "MEDIUM":
            return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400";
        case "LOW":
            return "bg-green-500/20 border-green-500/40 text-green-400";
        default:
            return "bg-zinc-700/30 border-zinc-600/30 text-zinc-400";
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case "OPEN":
            return "text-blue-400";
        case "IN_PROGRESS":
            return "text-yellow-400";
        case "RESOLVED":
            return "text-green-400";
        case "CLOSED":
            return "text-zinc-400";
        default:
            return "text-zinc-400";
    }
}

function getStatusIcon(status: string) {
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
}

function getSeverityGlow(level: string) {
    switch (level) {
        case "CRITICAL":
            return "shadow-[0_0_20px_rgba(248,113,113,0.3)]";
        case "HIGH":
            return "shadow-[0_0_20px_rgba(251,146,60,0.25)]";
        case "MEDIUM":
            return "shadow-[0_0_15px_rgba(250,204,21,0.2)]";
        case "LOW":
            return "shadow-[0_0_15px_rgba(74,222,128,0.15)]";
        default:
            return "";
    }
}

function IncidentCapsule({
    incident,
    index,
    totalVisible,
    onTap,
    onSwipeUp,
}: {
    incident: Incident;
    index: number;
    totalVisible: number;
    onTap: () => void;
    onSwipeUp: () => void;
}) {
    const touchStartY = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const diff = e.touches[0].clientY - touchStartY.current;
        if (diff > 0) {
            setDragOffset(Math.min(diff, 80));
        }
    };

    const handleTouchEnd = () => {
        if (dragOffset > 40) {
            onSwipeUp();
        }
        setDragOffset(0);
        setIsDragging(false);
    };

    const zIndex = totalVisible - index;
    const translateY = index * 6;
    const scale = 1 - index * 0.03;
    const opacity = 1 - index * 0.2;

    return (
        <div
            className="absolute left-1/2 transition-all duration-300 ease-out cursor-pointer"
            style={{
                zIndex,
                top: `${translateY + (index === 0 ? dragOffset * 0.5 : 0)}px`,
                transform: `translateX(-50%) scale(${scale})`,
                opacity: index === 0 && dragOffset > 20 ? opacity * 0.6 : opacity,
            }}
            onTouchStart={index === 0 ? handleTouchStart : undefined}
            onTouchMove={index === 0 ? handleTouchMove : undefined}
            onTouchEnd={index === 0 ? handleTouchEnd : undefined}
            onClick={index === 0 ? onTap : undefined}
        >
            <div
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-xl border ${getSeverityColor(
                    incident.severity
                )} bg-zinc-900/90 ${getSeverityGlow(incident.severity)}`}
            >
                <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full ${getSeverityColor(
                        incident.severity
                    )}`}
                >
                    <Shield className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0 max-w-48">
                    <h4 className="text-xs font-bold text-white truncate">{incident.title}</h4>
                    <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
                        <span className={getStatusColor(incident.status)}>{getStatusIcon(incident.status)}</span>
                        {incident.status.replace("_", " ")} • Tap to manage
                    </p>
                </div>

                <ChevronUp className="w-4 h-4 text-zinc-500 animate-bounce shrink-0" />
            </div>
        </div>
    );
}

export default function MobileResponderStack({ incidents, onIncidentUpdate }: MobileResponderStackProps) {
    const [stackOrder, setStackOrder] = useState<number[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    useEffect(() => {
        setStackOrder(incidents.map((_, i) => i));
    }, [incidents]);

    const rotateStack = useCallback(() => {
        setStackOrder(prev => {
            if (prev.length <= 1) return prev;
            const newOrder = [...prev];
            const first = newOrder.shift();
            if (first !== undefined) newOrder.push(first);
            return newOrder;
        });
    }, []);

    const handleTap = useCallback((incident: Incident) => {
        setSelectedIncident(incident);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedIncident(null);
    }, []);

    const handleUpdate = useCallback(
        (updatedIncident: Incident) => {
            setSelectedIncident(updatedIncident);
            onIncidentUpdate?.(updatedIncident);
        },
        [onIncidentUpdate]
    );

    if (incidents.length === 0 || stackOrder.length === 0) return null;

    const visibleCount = Math.min(3, incidents.length);
    const orderedIncidents = stackOrder.map(i => incidents[i]).filter(Boolean);

    if (orderedIncidents.length === 0) return null;

    return (
        <>
            <div className="md:hidden fixed top-6 left-0 right-0 z-30 flex flex-col items-center">
                <div className="relative w-full h-20">
                    {orderedIncidents.slice(0, visibleCount).map((incident, index) => (
                        <IncidentCapsule
                            key={incident.id}
                            incident={incident}
                            index={index}
                            totalVisible={visibleCount}
                            onTap={() => handleTap(incident)}
                            onSwipeUp={rotateStack}
                        />
                    ))}
                </div>

                {incidents.length > 1 && (
                    <div className="flex gap-1.5 mt-1">
                        {incidents.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    stackOrder[0] === i ? "bg-blue-400 w-4" : "bg-zinc-600 w-1"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedIncident && (
                <div
                    className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute -top-12 right-0 p-2 rounded-full bg-zinc-800/80 backdrop-blur border border-white/10 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <ResponderIncidentCard incident={selectedIncident} onUpdate={handleUpdate} />
                    </div>
                </div>
            )}
        </>
    );
}
