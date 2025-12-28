"use client";

import { AlertTriangle, ChevronRight, Eye, Map, Radio, Shield, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function ParticleField() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const particles = useMemo(() => {
        if (!mounted) return [];
        return [...Array(50)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 2 + Math.random() * 3,
        }));
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute w-1 h-1 bg-cyan-500/30 rounded-full animate-pulse"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

function GlowingOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
            <div
                className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse"
                style={{ animationDelay: "1s" }}
            />
            <div
                className="absolute -bottom-40 left-1/3 w-72 h-72 bg-red-500/10 rounded-full blur-[100px] animate-pulse"
                style={{ animationDelay: "2s" }}
            />
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
    gradient,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <div className="group relative">
            <div
                className={`absolute inset-0 ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
            />
            <div className="relative h-full p-6 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className={`inline-flex p-3 rounded-xl ${gradient} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

// Tech badge component with image icon
function TechBadge({ name, iconSrc }: { name: string; iconSrc: string }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/60 backdrop-blur-sm border border-white/10 rounded-full hover:border-cyan-500/30 hover:bg-zinc-700/60 transition-all duration-300">
            <Image src={iconSrc} alt={name} width={20} height={20} className="w-5 h-5 object-contain" />
            <span className="text-sm font-medium text-zinc-300">{name}</span>
        </div>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative">
                            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
                            <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-30" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold tracking-tight">ARGUS</span>
                        <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                            BETA
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            href="/login"
                            className="px-3 sm:px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 whitespace-nowrap"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20">
                <GlowingOrbs />
                <ParticleField />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                    }}
                />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-16 md:pt-0">
                    {/* Status badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/60 backdrop-blur-sm border border-white/10 rounded-full mb-8 mt-4 md:mt-0">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-zinc-300">System Operational • Real-time monitoring active</span>
                    </div>

                    {/* Main headline */}
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                            Incident Response
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                            Reimagined
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Real-time situational awareness for emergency responders. Report incidents, coordinate
                        responses, and save lives with millisecond precision.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/report"
                            className="group relative px-8 py-4 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 rounded-2xl transition-all duration-300 shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1"
                        >
                            <span className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Report Incident
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        <Link
                            href="/respond"
                            className="group px-8 py-4 text-lg font-semibold bg-zinc-800/60 hover:bg-zinc-700/60 border border-white/10 hover:border-cyan-500/30 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <span className="flex items-center gap-2">
                                <Radio className="w-5 h-5 text-cyan-400" />
                                Responder Dashboard
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white/40 rounded-full animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-4 block">
                            Core Capabilities
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Built for <span className="text-cyan-400">Critical Moments</span>
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Every second counts in emergency response. Argus delivers the speed, accuracy, and clarity
                            your team needs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={Zap}
                            title="Real-Time Operations"
                            description="WebSocket-powered live updates ensure responders receive alerts instantly. No refreshing, no delays, just pure reactive response."
                            gradient="bg-gradient-to-br from-yellow-500/80 to-orange-600/80"
                        />
                        <FeatureCard
                            icon={Star}
                            title="Trust & Karma System"
                            description="Reputation engine filters spam and fake reports. Verified contributors rise, bad actors fade away."
                            gradient="bg-gradient-to-br from-purple-500/80 to-pink-600/80"
                        />
                        <FeatureCard
                            icon={Map}
                            title="Tactical Map Interface"
                            description="Dark-mode geospatial visualization with real-time incident plotting. See the battlefield clearly, respond strategically."
                            gradient="bg-gradient-to-br from-cyan-500/80 to-blue-600/80"
                        />
                    </div>

                    {/* Additional features row */}
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <FeatureCard
                            icon={Eye}
                            title="Visual Evidence System"
                            description="Instant image uploads allow responders to verify incidents visually before deployment. See it to believe it."
                            gradient="bg-gradient-to-br from-green-500/80 to-emerald-600/80"
                        />
                        <FeatureCard
                            icon={Radio}
                            title="Responder Coordination"
                            description="Dedicated responder dashboard with priority queuing, status updates, and resolution tracking. Command your operations."
                            gradient="bg-gradient-to-br from-red-500/80 to-rose-600/80"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-4 block">
                            Workflow
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            From Report to <span className="text-cyan-400">Resolution</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Report",
                                desc: "Citizen reports incident with location & evidence",
                                icon: AlertTriangle,
                            },
                            {
                                step: "02",
                                title: "Validate",
                                desc: "Karma system filters & prioritizes reports",
                                icon: Star,
                            },
                            { step: "03", title: "Dispatch", desc: "Responders receive real-time alerts", icon: Radio },
                            { step: "04", title: "Resolve", desc: "Track, respond, and close incidents", icon: Shield },
                        ].map((item, i) => (
                            <div key={i} className="relative text-center">
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                                )}
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-zinc-900/60 border border-cyan-500/20 mb-4">
                                    <item.icon className="w-10 h-10 text-cyan-400" />
                                </div>
                                <div className="text-cyan-400 font-bold text-sm mb-2">{item.step}</div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-zinc-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-4 block">
                        Technology
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Powered By <span className="text-cyan-400">Modern Stack</span>
                    </h2>
                    <p className="text-zinc-400 mb-12">Enterprise-grade technology for mission-critical operations</p>

                    <div className="flex flex-wrap justify-center gap-3">
                        <TechBadge name="Next.js 15" iconSrc="/icons/nextjs.png" />
                        <TechBadge name="NestJS" iconSrc="/icons/nestjs.png" />
                        <TechBadge name="PostgreSQL" iconSrc="/icons/postgresql.png" />
                        <TechBadge name="Prisma ORM" iconSrc="/icons/prismaorm.png" />
                        <TechBadge name="WebSockets" iconSrc="/icons/websockets.png" />
                        <TechBadge name="Leaflet Maps" iconSrc="/icons/leaf.png" />
                        <TechBadge name="TailwindCSS" iconSrc="/icons/tailwind.png" />
                        <TechBadge name="TypeScript" iconSrc="/icons/typescript.png" />
                        <TechBadge name="JWT Auth" iconSrc="/icons/jwt.png" />
                        <TechBadge name="Socket.io" iconSrc="/icons/socketio.svg" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-red-500/10 border border-white/10 p-12 text-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
                        <GlowingOrbs />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Transform Emergency Response?
                            </h2>
                            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                                Report faster, respond smarter, save lives.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/register"
                                    className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1"
                                >
                                    Create Free Account
                                </Link>
                                <Link
                                    href="/report"
                                    className="px-8 py-4 text-lg font-semibold bg-zinc-800/60 hover:bg-zinc-700/60 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300"
                                >
                                    Try Demo
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-cyan-400" />
                        <span className="font-bold">ARGUS</span>
                        <span className="text-zinc-500 text-sm">• Real-Time Incident Response Platform</span>
                    </div>
                    <div className="text-zinc-500 text-sm">Built with 💙 by team O(n!)</div>
                </div>
            </footer>
        </div>
    );
}
