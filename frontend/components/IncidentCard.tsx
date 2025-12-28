import type { Incident } from "@/types/incident";

export default function IncidentCard({ incident }: { incident: Incident }) {
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
                </div>
            </div>
        </div>
    );
}
