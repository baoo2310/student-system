import type { UserRole } from "@shared/index";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "src/store/store";

interface ProtectedRouteProps {
    allowedRole?: UserRole;
    children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
    const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

    // Redirect to login if not authenticated
    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Check role if specified
    if (allowedRole && currentUser.role !== allowedRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}