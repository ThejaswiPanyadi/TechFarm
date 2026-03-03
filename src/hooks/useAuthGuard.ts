import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, UserRole } from "@/context/AuthContext";

export function useAuthGuard(requiredRole: UserRole) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (profile && profile.role !== requiredRole) {
            router.replace("/unauthorized");
        }
    }, [user, profile, loading, requiredRole, router]);

    return { user, profile, loading };
}
