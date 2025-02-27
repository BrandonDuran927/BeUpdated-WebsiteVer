import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageProducts from "../pages/admin/ManageProducts";
import ManageOrders from "../pages/admin/ManageOrders";
import AdminProfile from "../pages/admin/AdminProfile";

// Layout Components
import AdminNavbar from "../components/layout/adminLayout/AdminNavBar";
import AdminFooter from "../components/layout/adminLayout/AdminFooter";

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const authContext = useContext(AuthContext);

    if (authContext?.loading) {
        return <div>Loading...</div>;  // ✅ Prevents premature redirection
    }

    if (!authContext?.user || authContext.role !== "admin") {
        return <Navigate to="/" replace />;
    }


    return <>{children}</>;
};

const AdminRoutes: React.FC = () => {
    return (
        <>
            <AdminNavbar />
            <main className="min-h-screen pt-16 pb-20">
                <Routes>
                    <Route path="dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                    <Route path="orders" element={<AdminProtectedRoute><ManageOrders /></AdminProtectedRoute>} />
                    <Route path="products" element={<AdminProtectedRoute><ManageProducts /></AdminProtectedRoute>} />
                    <Route path="profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />
                </Routes>
            </main>
            <AdminFooter />
        </>
    );
};

export default AdminRoutes;
