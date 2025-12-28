"use client";
import { useAuth } from "@/hooks/useAuth";
import api from "@/libs/axios";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
    const { user, loading: authLoading } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Redirect logged-in users
    useEffect(() => {
        if (!authLoading && user) {
            router.replace("/report");
        }
    }, [authLoading, user, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const response = await api.post("/auth/login", {
                username,
                password,
            });

            setMessage(response.data.message || "Login successful!");
            setTimeout(() => {
                router.push("/report");
            }, 1000);
        } catch (error: any) {
            setError(error.response?.data?.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking auth
    if (authLoading || user) {
        return (
            <div className="w-screen h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-screen min-h-screen overflow-hidden bg-zinc-950">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />

            {/* Radial Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-500/5 rounded-full blur-3xl" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-900/10 via-transparent to-purple-900/10" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-4">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                        <p className="text-zinc-400 text-sm mt-2">Sign in to continue to Argus</p>
                    </div>

                    {/* Glass Card */}
                    <div className="rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-6 md:p-8">
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {message && (
                                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                    <p className="text-sm text-green-400">{message}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Username Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="username"
                                        className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                                    >
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            id="username"
                                            onChange={e => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                            value={username}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800/50 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            name="username"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            value={password}
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-zinc-800/50 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            name="password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 md:px-8 py-4 bg-zinc-900/40 border-t border-white/5">
                            <p className="text-center text-sm text-zinc-500">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Text */}
                    <p className="text-center text-xs text-zinc-600 mt-6">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
