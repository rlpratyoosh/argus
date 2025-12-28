"use client";

import { useAuth } from "@/hooks/useAuth";
import api from "@/libs/axios";
import {
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    Crown,
    Edit3,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    User,
    Users,
    X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface UserData {
    id: string;
    username: string;
    email: string;
    userType: "USER" | "RESPONDER" | "ADMIN";
    trustScore: number;
    city: string | null;
    state: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    _count: {
        incidentsReported: number;
    };
}

interface Stats {
    totalUsers: number;
    responders: number;
    admins: number;
    regularUsers: number;
    shadowBanned: number;
    totalIncidents: number;
}

type UserTypeFilter = "ALL" | "USER" | "RESPONDER" | "ADMIN";

export default function AdminDashboard() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>("ALL");
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [editForm, setEditForm] = useState({
        userType: "USER" as "USER" | "RESPONDER" | "ADMIN",
        trustScore: 100,
        city: "",
        state: "",
    });
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [usersRes, statsRes] = await Promise.all([
                api.get<UserData[]>("/users"),
                api.get<Stats>("/users/stats"),
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (err: any) {
            console.error("Failed to fetch data", err);
            setError(err.response?.data?.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && currentUser?.userType === "ADMIN") {
            fetchData();
        }
    }, [authLoading, currentUser, fetchData]);

    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setEditForm({
            userType: user.userType,
            trustScore: user.trustScore,
            city: user.city || "",
            state: user.state || "",
        });
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;

        try {
            setSaving(true);
            await api.patch(`/users/${editingUser.id}`, {
                userType: editForm.userType,
                trustScore: editForm.trustScore,
                city: editForm.city || null,
                state: editForm.state || null,
            });

            // Update local state
            setUsers(prev =>
                prev.map(u =>
                    u.id === editingUser.id
                        ? {
                              ...u,
                              userType: editForm.userType,
                              trustScore: editForm.trustScore,
                              city: editForm.city || null,
                              state: editForm.state || null,
                          }
                        : u
                )
            );
            setEditingUser(null);
            fetchData(); // Refresh stats
        } catch (err: any) {
            console.error("Failed to update user", err);
            alert(err.response?.data?.message || "Failed to update user");
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = userTypeFilter === "ALL" || user.userType === userTypeFilter;
        return matchesSearch && matchesType;
    });

    const getUserTypeColor = (type: string) => {
        switch (type) {
            case "ADMIN":
                return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            case "RESPONDER":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            default:
                return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
        }
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 100) return "text-green-400";
        if (score >= 50) return "text-yellow-400";
        if (score >= 0) return "text-orange-400";
        return "text-red-400";
    };

    if (authLoading) {
        return (
            <div className="w-screen h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                                <p className="text-xs text-zinc-500">Manage users and system settings</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs text-zinc-500">Total Users</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs text-zinc-500">Regular</span>
                            </div>
                            <p className="text-2xl font-bold text-zinc-400">{stats.regularUsers}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-blue-400/60">Responders</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{stats.responders}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-purple-400/60">Admins</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-400">{stats.admins}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-red-400/60">Shadow Banned</span>
                            </div>
                            <p className="text-2xl font-bold text-red-400">{stats.shadowBanned}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-amber-400/60">Incidents</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-400">{stats.totalIncidents}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={userTypeFilter}
                            onChange={e => setUserTypeFilter(e.target.value as UserTypeFilter)}
                            className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-zinc-900/60 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                        >
                            <option value="ALL">All Types</option>
                            <option value="USER">Users</option>
                            <option value="RESPONDER">Responders</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
                        <p className="text-red-400 font-medium">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-zinc-900/60 border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Trust Score
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Reports
                                        </th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {user.username.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{user.username}</p>
                                                        <p className="text-xs text-zinc-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getUserTypeColor(
                                                        user.userType
                                                    )}`}
                                                >
                                                    {user.userType === "ADMIN" && <Crown className="w-3 h-3" />}
                                                    {user.userType === "RESPONDER" && <Shield className="w-3 h-3" />}
                                                    {user.userType === "USER" && <User className="w-3 h-3" />}
                                                    {user.userType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`font-bold ${getTrustScoreColor(user.trustScore)}`}
                                                    >
                                                        {user.trustScore}
                                                    </span>
                                                    {user.trustScore < 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                                                            BANNED
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.city && user.state ? (
                                                    <span className="text-sm text-zinc-400">
                                                        {user.city}, {user.state}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-zinc-600">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-zinc-400">
                                                    {user._count.incidentsReported}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 rounded-lg bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="w-12 h-12 text-zinc-600 mb-3" />
                                <p className="text-zinc-400">No users found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <h3 className="text-lg font-bold">Edit User</h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* User Info */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                    {editingUser.username.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{editingUser.username}</p>
                                    <p className="text-xs text-zinc-500">{editingUser.email}</p>
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    User Role
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["USER", "RESPONDER", "ADMIN"] as const).map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setEditForm({ ...editForm, userType: role })}
                                            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                                editForm.userType === role
                                                    ? getUserTypeColor(role)
                                                    : "bg-zinc-800/50 text-zinc-500 border-white/5 hover:bg-zinc-700/50"
                                            }`}
                                        >
                                            {role === "ADMIN" && <Crown className="w-3.5 h-3.5" />}
                                            {role === "RESPONDER" && <Shield className="w-3.5 h-3.5" />}
                                            {role === "USER" && <User className="w-3.5 h-3.5" />}
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Score */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Trust Score
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={editForm.trustScore}
                                        onChange={e =>
                                            setEditForm({ ...editForm, trustScore: parseInt(e.target.value) || 0 })
                                        }
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setEditForm({ ...editForm, trustScore: 100 })}
                                            className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-all"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => setEditForm({ ...editForm, trustScore: -1 })}
                                            className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all"
                                        >
                                            Ban
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-1.5 text-[10px] text-zinc-600">
                                    Users with score below 0 are shadow-banned
                                </p>
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.city}
                                        onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                        placeholder="City"
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.state}
                                        onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                                        placeholder="State"
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-white/5 bg-zinc-900/50">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUser}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
