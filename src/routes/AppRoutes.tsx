import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
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
import AdminRoutes from './AdminRoutes'; // 🔹 Import Admin Routes

// Layout Components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
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
        </BrowserRouter>

    );
};

export default AppRoutes;
