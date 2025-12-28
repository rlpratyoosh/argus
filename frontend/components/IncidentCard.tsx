import api from "@/libs/axios";
import type { Incident } from "@/types/incident";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface VoteResponse {
    message: string;
    upVoted: boolean;
    downVoted: boolean;
}

interface IncidentCardProps {
    incident: Incident;
}

export default function IncidentCard({ incident }: IncidentCardProps) {
    const [votes, setVotes] = useState(incident.votes);
    const [isVoting, setIsVoting] = useState(false);
    const [upVoted, setUpVoted] = useState(incident.userVote?.upVoted ?? false);
    const [downVoted, setDownVoted] = useState(incident.userVote?.downVoted ?? false);

    const handleUpvote = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isVoting) return;

        setIsVoting(true);
        try {
            const res = await api.patch<VoteResponse>(`/incident/upvote/${incident.id}`);
            setUpVoted(res.data.upVoted);
            setDownVoted(res.data.downVoted);

            if (upVoted) {
                setVotes(prev => prev - 1);
            } else if (downVoted) {
                setVotes(prev => prev + 2);
            } else {
                setVotes(prev => prev + 1);
            }
        } catch (err) {
            console.error("Failed to upvote", err);
        } finally {
            setIsVoting(false);
        }
    };

    const handleDownvote = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isVoting) return;

        setIsVoting(true);
        try {
            const res = await api.patch<VoteResponse>(`/incident/downvote/${incident.id}`);
            setUpVoted(res.data.upVoted);
            setDownVoted(res.data.downVoted);

            if (downVoted) {
                setVotes(prev => prev + 1);
            } else if (upVoted) {
                setVotes(prev => prev - 2);
            } else {
                setVotes(prev => prev - 1);
            }
        } catch (err) {
            console.error("Failed to downvote", err);
        } finally {
            setIsVoting(false);
        }
    };

    const getSeverityStyle = (level: string) => {
        switch (level) {
            case "CRITICAL":
                return "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]";
            case "HIGH":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(251,146,60,0.1)]";
            case "MEDIUM":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "LOW":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            default:
                return "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
        }
    };

    return (
        <div
            className="group relative flex gap-3 p-3 rounded-2xl
                        /* Glass Base */
                        bg-zinc-900/40 backdrop-blur-md 
                        border border-white/5 
                        /* Hover Effects */
                        hover:bg-zinc-800/60 hover:border-white/10 
                        hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5
                        transition-all duration-300 ease-out cursor-pointer overflow-hidden"
        >
            <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-zinc-800">
                {incident.images.length > 0 ? (
                    <img
                        src={incident.images[0]}
                        alt={incident.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <img
                        src="./icons/hard-incident.png"
                        alt="No Images Found"
                        className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                    />
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white bg-white/10 backdrop-blur-md rounded border border-white/10">
                    {incident.status}
                </span>
            </div>

            <div className="flex flex-col flex-1 min-w-0 py-0.5 justify-between">
                <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-white leading-tight truncate group-hover:text-blue-300 transition-colors">
                            {incident.title}
                        </h3>

                        <span
                            className={`shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-full border ${getSeverityStyle(
                                incident.severity
                            )}`}
                        >
                            {incident.severity}
                        </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{incident.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                    <span className="text-[10px] font-mono text-zinc-600">
                        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                    </span>

                    {/* Vote Controls */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleUpvote}
                            disabled={isVoting}
                            className={`group/btn p-1.5 rounded-lg border active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                upVoted
                                    ? "bg-green-500/20 border-green-500/30"
                                    : "bg-zinc-800/50 border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                            }`}
                            title="Upvote"
                        >
                            <ThumbsUp
                                className={`w-3.5 h-3.5 transition-colors ${
                                    upVoted ? "text-green-400" : "text-zinc-500 group-hover/btn:text-green-400"
                                }`}
                            />
                        </button>

                        <span
                            className={`text-xs font-bold min-w-6 text-center transition-colors ${
                                votes > 0 ? "text-green-400" : votes < 0 ? "text-red-400" : "text-zinc-400"
                            }`}
                        >
                            {votes}
                        </span>

                        <button
                            onClick={handleDownvote}
                            disabled={isVoting}
                            className={`group/btn p-1.5 rounded-lg border active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                downVoted
                                    ? "bg-red-500/20 border-red-500/30"
                                    : "bg-zinc-800/50 border-white/5 hover:bg-red-500/10 hover:border-red-500/20"
                            }`}
                            title="Downvote"
                        >
                            <ThumbsDown
                                className={`w-3.5 h-3.5 transition-colors ${
                                    downVoted ? "text-red-400" : "text-zinc-500 group-hover/btn:text-red-400"
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
