import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import OrderContext from '../../context/OrderContext'; // ✅ Import OrderContext

const Navbar: React.FC = () => {
    const authContext = useContext(AuthContext);
    const { getItemCount } = useContext(CartContext);
    const { wishlistItems } = useContext(WishlistContext);
    const orderContext = useContext(OrderContext);

    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    if (!authContext || !orderContext) {
        throw new Error("Auth context must be used within an AuthProvider");
    }

    const { orders } = orderContext;
    const { user, logoutUser } = authContext;
    const isAuthenticated = !!user;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // ✅ Prevent error by checking if products is an array before using .some()
    const pendingOrdersCount = orders.filter(order =>
        Array.isArray(order.products) && order.products.some(product => product.status === "pending")
    ).length;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: '#1434A4' }}>
            <div className="container">
                <Link className="navbar-brand" to="/" style={{ color: '#FEE055' }}>
                    BEUpdated
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <form className="d-flex mx-auto" onSubmit={handleSearch}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search products..."
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn" type="submit" style={{ backgroundColor: '#FEE055', color: '#1434A4' }}>
                            Search
                        </button>
                    </form>

                    <ul className="navbar-nav mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Home
                            </Link>
                        </li>

                        {isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link position-relative" to="/wishlist">
                                        Wishlist
                                        {wishlistItems.length > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ backgroundColor: '#FEE055', color: '#1434A4' }}>
                                                {wishlistItems.length}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link position-relative" to="/cart">
                                        Cart
                                        {getItemCount() > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ backgroundColor: '#FEE055', color: '#1434A4' }}>
                                                {getItemCount()}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link position-relative" to="/orders">
                                        Orders
                                        {pendingOrdersCount > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ backgroundColor: '#FEE055', color: '#1434A4' }}>
                                                {pendingOrdersCount}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {user?.displayName || user?.email?.split('@')[0] || 'Profile'}
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">
                                                My Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/login" onClick={logoutUser}>
                                                Logout
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
