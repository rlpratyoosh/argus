"use client";

import { useAuth } from "@/hooks/useAuth";
import api from "@/libs/axios";
import type { Incident } from "@/types/incident";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    MapPin,
    Shield,
    ThumbsDown,
    ThumbsUp,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"reports" | "votes">("reports");
    const [myReports, setMyReports] = useState<Incident[]>([]);
    const [myVotes, setMyVotes] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportsRes, votesRes] = await Promise.all([
                    api.get<Incident[]>("/incident/my-reports"),
                    api.get<Incident[]>("/incident/my-votes"),
                ]);
                setMyReports(reportsRes.data);
                setMyVotes(votesRes.data);
            } catch (err) {
                console.error("Failed to fetch profile data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getSeverityStyle = (level: string) => {
        switch (level) {
            case "CRITICAL":
                return "bg-red-500/10 text-red-400 border-red-500/20";
            case "HIGH":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "MEDIUM":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "LOW":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            default:
                return "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
        }
    };

    const getValidationStyle = (validation: string) => {
        switch (validation) {
            case "VALIDATED":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            case "REJECTED":
                return "bg-red-500/10 text-red-400 border-red-500/20";
            case "PENDING":
            default:
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "RESOLVED":
            case "CLOSED":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            case "IN_PROGRESS":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "OPEN":
            default:
                return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    const getValidationIcon = (validation: string) => {
        switch (validation) {
            case "VALIDATED":
                return <CheckCircle2 className="w-3.5 h-3.5" />;
            case "REJECTED":
                return <XCircle className="w-3.5 h-3.5" />;
            case "PENDING":
            default:
                return <Clock className="w-3.5 h-3.5" />;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const initials = user.username
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const getTrustScoreColor = (score: number) => {
        if (score >= 100) return "text-green-400";
        if (score >= 50) return "text-yellow-400";
        if (score >= 0) return "text-orange-400";
        return "text-red-400";
    };

    const getTrustScoreBg = (score: number) => {
        if (score >= 100) return "bg-green-500/10 border-green-500/20";
        if (score >= 50) return "bg-yellow-500/10 border-yellow-500/20";
        if (score >= 0) return "bg-orange-500/10 border-orange-500/20";
        return "bg-red-500/10 border-red-500/20";
    };

    const getTrustScoreLabel = (score: number) => {
        if (score >= 100) return "Excellent";
        if (score >= 75) return "Good";
        if (score >= 50) return "Fair";
        if (score >= 0) return "Low";
        return "Shadow-banned";
    };

    const validatedCount = myReports.filter(r => r.validation === "VALIDATED").length;
    const pendingCount = myReports.filter(r => r.validation === "PENDING").length;
    const rejectedCount = myReports.filter(r => r.validation === "REJECTED").length;
    const upvotedCount = myVotes.filter(v => v.userVote?.upVoted).length;
    const downvotedCount = myVotes.filter(v => v.userVote?.downVoted).length;

    return (
        <div className="min-h-screen bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
            {/* Header */}
            <div className="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/report")}
                            className="p-2 rounded-xl bg-zinc-800/50 border border-white/5 hover:bg-zinc-700/50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">My Profile</h1>
                            <p className="text-xs text-zinc-500">Your activity and reports</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
                {/* User Info Card */}
                <div className="p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar & Basic Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                                {initials}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{user.username}</h2>
                                <p className="text-sm text-zinc-400">{user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        {user.userType}
                                    </span>
                                    {user.city && user.state && (
                                        <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-zinc-800/50 text-zinc-400 border border-white/5">
                                            <MapPin className="w-3 h-3" />
                                            {user.city}, {user.state}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trust Score */}
                        <div className="flex-1 md:text-right">
                            <div
                                className={`inline-flex items-center gap-4 p-4 rounded-xl border ${getTrustScoreBg(
                                    user.trustScore
                                )}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className={`w-6 h-6 ${getTrustScoreColor(user.trustScore)}`} />
                                    <div>
                                        <p className="text-xs text-zinc-400">Trust Score</p>
                                        <p className={`text-2xl font-bold ${getTrustScoreColor(user.trustScore)}`}>
                                            {user.trustScore}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-l border-white/10 pl-4">
                                    <p className={`text-sm font-medium ${getTrustScoreColor(user.trustScore)}`}>
                                        {getTrustScoreLabel(user.trustScore)}
                                    </p>
                                    <p className="text-[10px] text-zinc-500">Based on report accuracy</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/5">
                        <div className="p-3 rounded-xl bg-zinc-800/30 border border-white/5 text-center">
                            <p className="text-2xl font-bold text-white">{myReports.length}</p>
                            <p className="text-xs text-zinc-500">Total Reports</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                            <p className="text-2xl font-bold text-green-400">{validatedCount}</p>
                            <p className="text-xs text-zinc-500">Validated</p>
                        </div>
                        <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-center">
                            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                            <p className="text-xs text-zinc-500">Pending</p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                            <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
                            <p className="text-xs text-zinc-500">Rejected</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center col-span-2 md:col-span-1">
                            <p className="text-2xl font-bold text-blue-400">{myVotes.length}</p>
                            <p className="text-xs text-zinc-500">Votes Cast</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                            activeTab === "reports"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-zinc-800/30 text-zinc-400 border border-white/5 hover:bg-zinc-700/30"
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        My Reports ({myReports.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("votes")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                            activeTab === "votes"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-zinc-800/30 text-zinc-400 border border-white/5 hover:bg-zinc-700/30"
                        }`}
                    >
                        <ThumbsUp className="w-4 h-4" />
                        My Votes ({myVotes.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === "reports" && (
                    <div className="space-y-3">
                        {myReports.length === 0 ? (
                            <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                                <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-zinc-300 mb-2">No Reports Yet</h3>
                                <p className="text-sm text-zinc-500 mb-4">
                                    You haven&apos;t reported any incidents yet.
                                </p>
                                <button
                                    onClick={() => router.push("/report/new")}
                                    className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/30 transition-colors"
                                >
                                    Report an Incident
                                </button>
                            </div>
                        ) : (
                            myReports.map(incident => (
                                <div
                                    key={incident.id}
                                    className="group p-4 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:bg-zinc-800/40 hover:border-white/10 transition-all"
                                >
                                    <div className="flex gap-4">
                                        {incident.images.length > 0 && (
                                            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-zinc-800">
                                                <img
                                                    src={incident.images[0]}
                                                    alt={incident.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-white truncate">{incident.title}</h3>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getValidationStyle(
                                                            incident.validation
                                                        )}`}
                                                    >
                                                        {getValidationIcon(incident.validation)}
                                                        {incident.validation}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-zinc-400 line-clamp-1 mt-1">
                                                {incident.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getSeverityStyle(
                                                        incident.severity
                                                    )}`}
                                                >
                                                    {incident.severity}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(
                                                        incident.status
                                                    )}`}
                                                >
                                                    {incident.status.replace("_", " ")}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <MapPin className="w-3 h-3" />
                                                    {incident.city}, {incident.state}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    {incident.votes} votes
                                                </span>
                                                <span className="text-xs text-zinc-600">
                                                    {new Date(incident.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "votes" && (
                    <div className="space-y-3">
                        {/* Vote Type Filter */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    {upvotedCount} upvoted
                                </span>
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    {downvotedCount} downvoted
                                </span>
                            </div>
                        </div>

                        {myVotes.length === 0 ? (
                            <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                                <ThumbsUp className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-zinc-300 mb-2">No Votes Yet</h3>
                                <p className="text-sm text-zinc-500 mb-4">
                                    You haven&apos;t voted on any incidents yet.
                                </p>
                                <button
                                    onClick={() => router.push("/report")}
                                    className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/30 transition-colors"
                                >
                                    Browse Incidents
                                </button>
                            </div>
                        ) : (
                            myVotes.map(incident => (
                                <div
                                    key={incident.id}
                                    className="group p-4 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:bg-zinc-800/40 hover:border-white/10 transition-all"
                                >
                                    <div className="flex gap-4">
                                        {/* Vote Indicator */}
                                        <div
                                            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                                                incident.userVote?.upVoted
                                                    ? "bg-green-500/20 border border-green-500/30"
                                                    : "bg-red-500/20 border border-red-500/30"
                                            }`}
                                        >
                                            {incident.userVote?.upVoted ? (
                                                <ThumbsUp className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <ThumbsDown className="w-5 h-5 text-red-400" />
                                            )}
                                        </div>

                                        {incident.images.length > 0 && (
                                            <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-zinc-800">
                                                <img
                                                    src={incident.images[0]}
                                                    alt={incident.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">{incident.title}</h3>
                                            <p className="text-sm text-zinc-400 line-clamp-1 mt-1">
                                                {incident.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getSeverityStyle(
                                                        incident.severity
                                                    )}`}
                                                >
                                                    {incident.severity}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getValidationStyle(
                                                        incident.validation
                                                    )}`}
                                                >
                                                    {getValidationIcon(incident.validation)}
                                                    {incident.validation}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <MapPin className="w-3 h-3" />
                                                    {incident.city}, {incident.state}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    {incident.votes} votes
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
