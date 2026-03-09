import type { UserRole } from "@shared/index";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "src/store/store";

interface ProtectedRouteProps {
    allowedRole: UserRole;
    children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
    const { currentUser } = useSelector((state: RootState) => state.user);
    if (allowedRole && currentUser?.role !== allowedRole) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
}