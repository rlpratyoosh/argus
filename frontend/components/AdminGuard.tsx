"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (!loading && user && user.userType !== "ADMIN") {
            router.push("/report");
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

    if (user?.userType !== "ADMIN") {
        return null;
    }

    return <>{children}</>;
}
