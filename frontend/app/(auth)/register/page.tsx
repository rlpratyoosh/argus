"use client";
import api from "@/libs/axios";
import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const response = await api.post("/auth/register", {
                username,
                email,
                password,
            });

            setMessage(response.data.message);
            setUsername("");
            setEmail("");
            setPassword("");
        } catch (error: any) {
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-w-screen min-h-screen">
            {error && <div className="text-sm p-2 text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    value={username}
                    className="border p-2"
                    name="username"
                    required
                />
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    value={email}
                    className="border p-2"
                    name="email"
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    value={password}
                    className="border p-2"
                    name="password"
                    required
                />
                <br />
                <button type="submit" className="px-1 py-2 text-sm border-2">
                    Register
                </button>
            </form>
            {message && <div className="text-sm p-2 text-green-400">{message}</div>}
        </div>
    );
}
