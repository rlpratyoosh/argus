"use client";
import { useAuth } from "@/hooks/useAuth";
import api from "@/libs/axios";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterPage() {
    const { user, loading: authLoading } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post("/auth/register", {
                username,
                email,
                password,
            });

            setMessage(response.data.message || "Account created successfully!");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
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
                    <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-screen min-h-screen overflow-hidden bg-zinc-950">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />

            {/* Radial Glow Effects */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-500/5 rounded-full blur-3xl" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-900/10 via-transparent to-blue-900/10" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 mb-4">
                            <Shield className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
                        <p className="text-zinc-400 text-sm mt-2">Join Argus and help keep your community safe</p>
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

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                            placeholder="Choose a username"
                                            value={username}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800/50 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            name="username"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                                    >
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            value={email}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800/50 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            name="email"
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
                                            placeholder="Create a password"
                                            value={password}
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-zinc-800/50 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
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

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800/50 border text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                                                confirmPassword && password !== confirmPassword
                                                    ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                                                    : confirmPassword && password === confirmPassword
                                                    ? "border-green-500/50 focus:border-green-500/50 focus:ring-green-500/20"
                                                    : "border-white/5 focus:border-purple-500/50 focus:ring-purple-500/20"
                                            }`}
                                            name="confirmPassword"
                                            required
                                        />
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || (!!confirmPassword && password !== confirmPassword)}
                                    className="w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 mt-6"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 md:px-8 py-4 bg-zinc-900/40 border-t border-white/5">
                            <p className="text-center text-sm text-zinc-500">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Text */}
                    <p className="text-center text-xs text-zinc-600 mt-6">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
