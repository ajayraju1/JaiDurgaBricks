"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

// Higher-order component to protect routes that require authentication
export default function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedRoute(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push("/login");
      }
    }, [isLoading, user, router]);

    // Show nothing while checking authentication
    if (isLoading) {
      return (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    // Show nothing if not authenticated (will redirect)
    if (!user) {
      return null;
    }

    // Render the protected component if authenticated
    return <Component {...props} />;
  };
}
