"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResponderGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            console.log(user)
            if (!user) {
                router.push("/login");
            } else if (user.userType !== "RESPONDER" && user.userType !== "ADMIN") {
                router.push("/report");
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!user || (user.userType !== "RESPONDER" && user.userType !== "ADMIN")) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Access Denied</h2>
                    <p className="text-zinc-400 text-sm">You need RESPONDER or ADMIN privileges to access this area.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
