"use client";
import api from "@/libs/axios";
import { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassowrd] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const response = await api.post("/auth/login", {
                username,
                password,
            });

            setMessage(response.data.message);
        } catch (error: any) {
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    // const requestOTP = async () => {
    //     setError("");
    //     setOTP("");

    //     try {
    //         const response = await api.post("/auth/sendotp", {
    //             username,
    //             password,
    //         });

    //         console.log(response.data);

    //         setMessage(response.data.message);
    //         setOtpRequested(true);
    //     } catch (error: any) {
    //         setError(error.response?.data?.message || "An error occurred");
    //     }
    // };

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
                />
                <label htmlFor="password">Passowrd</label>
                <input
                    type="text"
                    onChange={e => setPassowrd(e.target.value)}
                    placeholder="Enter your password"
                    value={password}
                    className="border p-2"
                    name="password"
                />
                <button type="submit" className="px-1 py-2 text-sm border-2">
                    Login
                </button>
            </form>
            {message && <div className="text-sm p-2 text-green-400">{message}</div>}
        </div>
    );
}
