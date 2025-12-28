"use client";

import { useAuth } from "@/hooks/useAuth";
import api from "@/libs/axios";
import { LogOut, Monitor, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ProfileCapsule() {
    const { user, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await api.post("/auth/logout");
            router.push("/login");
        } catch (err) {
            console.error("Failed to logout", err);
        } finally {
            setIsLoggingOut(false);
        }
    }, [router]);

    const handleLogoutAll = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await api.post("/auth/logoutall");
            router.push("/login");
        } catch (err) {
            console.error("Failed to logout from all devices", err);
        } finally {
            setIsLoggingOut(false);
        }
    }, [router]);

    // Don't render if not logged in
    if (loading || !user) return null;

    // Get initials from username
    const initials = user.username
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="fixed top-7 right-4 md:top-6 md:right-6 z-40" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                    isOpen
                        ? "bg-zinc-800/80 border-white/20 shadow-lg shadow-black/20"
                        : "bg-zinc-900/60 border-white/10 hover:bg-zinc-800/70 hover:border-white/15"
                }`}
            >
                {/* Avatar Circle */}
                <div className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                    {initials}
                </div>

                {/* Username - Hidden on mobile */}
                <span className="hidden md:block pr-4 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                    {user.username}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        {user.userType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Score */}
                    <div className="px-4 py-3 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        user.trustScore >= 100
                                            ? "bg-green-500/10 border border-green-500/20"
                                            : user.trustScore >= 50
                                            ? "bg-yellow-500/10 border border-yellow-500/20"
                                            : user.trustScore >= 0
                                            ? "bg-orange-500/10 border border-orange-500/20"
                                            : "bg-red-500/10 border border-red-500/20"
                                    }`}
                                >
                                    <Shield
                                        className={`w-4 h-4 ${
                                            user.trustScore >= 100
                                                ? "text-green-400"
                                                : user.trustScore >= 50
                                                ? "text-yellow-400"
                                                : user.trustScore >= 0
                                                ? "text-orange-400"
                                                : "text-red-400"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-300">Trust Score</p>
                                    <p className="text-[10px] text-zinc-500">Based on report accuracy</p>
                                </div>
                            </div>
                            <div
                                className={`text-lg font-bold ${
                                    user.trustScore >= 100
                                        ? "text-green-400"
                                        : user.trustScore >= 50
                                        ? "text-yellow-400"
                                        : user.trustScore >= 0
                                        ? "text-orange-400"
                                        : "text-red-400"
                                }`}
                            >
                                {user.trustScore}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/5 flex items-center justify-center">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Sign Out</p>
                                <p className="text-[10px] text-zinc-500">Log out from this device</p>
                            </div>
                        </button>

                        <button
                            onClick={handleLogoutAll}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-zinc-300 hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Monitor className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Sign Out All Devices</p>
                                <p className="text-[10px] text-zinc-500">Log out from everywhere</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
