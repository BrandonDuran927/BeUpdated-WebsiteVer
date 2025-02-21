import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProductPage from '../pages/ProductPage';
import Wishlist from '../pages/Wishlist';
import Cart from '../pages/Cart';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import Profile from '../pages/Profile';
import Search from '../pages/Search';
import Checkout from '../pages/Checkout';
import PaymentSuccess from '../pages/PaymentSuccess';
// import NotFound from '../pages/NotFound';

// Layout Components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Navbar />
            <main className="min-h-screen pt-16 pb-20">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/search" element={<Search />} />

                    {/* Protected Routes */}
                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute>
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/order/:id"
                        element={
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment-success/:orderId"
                        element={
                            <ProtectedRoute>
                                <PaymentSuccess />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 Route */}
                    {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>
            </main>
            <Footer />
        </Router>
    );
};

export default AppRoutes;