import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageProducts from "../pages/admin/ManageProducts";
import ManageOrders from "../pages/admin/ManageOrders";

// Layout Components
import AdminNavbar from "../components/layout/adminLayout/AdminNavBar";
import AdminFooter from "../components/layout/adminLayout/AdminFooter";

// Loading component
const LoadingScreen = () => (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3 text-xl font-semibold">Loading admin panel...</p>
        </div>
    </div>
);

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const authContext = useContext(AuthContext);
    const location = useLocation();

    // Show loading screen while authentication is initializing
    if (authContext?.isInitializing) {
        return <LoadingScreen />;
    }

    // If user is not an admin, redirect them to the homepage
    if (!authContext?.user || authContext.role !== "admin") {
        console.warn("🚫 Unauthorized access to admin panel. Redirecting to home.");
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// Redirect component for the base admin path
const AdminRedirect = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (authContext?.isInitializing) {
            return; // Wait for initialization
        }

        if (authContext?.user && authContext.role === "admin") {
            navigate("/admin/dashboard", { replace: true });
        } else {
            navigate("/", { replace: true });
        }
    }, [authContext?.isInitializing, authContext?.user, authContext?.role, navigate]);

    return <LoadingScreen />;
};

const AdminRoutes: React.FC = () => {
    const authContext = useContext(AuthContext);

    // Show loading screen during initialization
    if (authContext?.isInitializing) {
        return <LoadingScreen />;
    }

    return (
        <>
            <AdminNavbar />
            <main className="min-h-screen pt-16 pb-20">
                <Routes>
                    <Route index element={<AdminRedirect />} />
                    <Route path="dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                    <Route path="orders" element={<AdminProtectedRoute><ManageOrders /></AdminProtectedRoute>} />
                    <Route path="products" element={<AdminProtectedRoute><ManageProducts /></AdminProtectedRoute>} />
                </Routes>
            </main>
            <AdminFooter />
        </>
    );
};

export default AdminRoutes;
