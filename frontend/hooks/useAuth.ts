import api from "@/libs/axios";
import { useEffect, useState } from "react";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface UseAuthReturn {
    loading: boolean;
    user: User | null;
    error: string | null;
}

export const useAuth = (): UseAuthReturn => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get("/auth/me");
                setUser(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { loading, user, error };
};
