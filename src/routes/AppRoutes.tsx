import React, { useContext } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductPage from "../pages/ProductPage";
import Wishlist from "../pages/Wishlist";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import Profile from "../pages/Profile";
import Search from "../pages/Search";
import Checkout from "../pages/Checkout";
import PaymentSuccess from "../pages/PaymentSuccess";
import AdminRoutes from "./AdminRoutes";

// Layout Components
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// Loading component
const LoadingScreen = () => (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3 text-xl font-semibold">Loading...</p>
        </div>
    </div>
);

// Root component to handle auth state
const AppRoutesContent = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <LoadingScreen />;
    }

    const { user, role, isInitializing } = authContext;

    // Show loading screen until authentication is fully initialized
    if (isInitializing) {
        return <LoadingScreen />;
    }

    // If user is an admin and not already in an admin route, redirect to admin dashboard
    if (user && role === "admin" && !window.location.pathname.startsWith("/admin")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <Routes>
            {/* Admin Routes - No student Navbar/Footer */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Student Pages */}
            <Route
                path="*"
                element={
                    <>
                        <Navbar />
                        <main className="min-h-screen pt-16 pb-20">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/product/:id" element={<ProductPage />} />
                                <Route path="/search" element={<Search />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/order/:id" element={<OrderDetails />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />
                            </Routes>
                        </main>
                        <Footer />
                    </>
                }
            />
        </Routes>
    );
};

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <AppRoutesContent />
        </BrowserRouter>
    );
};

export default AppRoutes;
