import { useEffect } from "react";
import { useRouter } from "next/router";

export function useAuthGuard(requiredRole: "admin" | "farmer") {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role) {
      router.replace("/login");
      return;
    }

    if (role !== requiredRole) {
      router.replace("/login");
    }
  }, [requiredRole, router]);
}
