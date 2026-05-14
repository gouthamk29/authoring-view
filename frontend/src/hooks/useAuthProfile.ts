import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types/workspace";
import axios from "axios";
import { useEffect, useState } from "react";

export function useAuthProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const { token, logout } = useAuth();

  useEffect(() => {
    async function fetchUser() {
      if (!token) return;

      try {
        setLoading(true);

        const res = await axios.get<User>(
          `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUser(res.data);
      } catch (error) {
        console.log(error);

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token, logout]);

  return {
    user,
    loading,
  };
}
