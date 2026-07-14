import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/apiTypes";
import { LoadingState } from "@/components/ui/Spinner";

const HOME_BY_ROLE: Record<Role, string> = {
  family: "/family",
  nurse: "/nurse",
  admin: "/admin",
};

export function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label="Loading your session..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;

  return <Outlet />;
}
