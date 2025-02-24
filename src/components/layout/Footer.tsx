import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';

const Footer: React.FC = () => {
    const authContext = useContext(AuthContext);
    const cartContext = useContext(CartContext);
    const wishlistContext = useContext(WishlistContext);

    const { user } = authContext || {}; // Ensure authContext is available
    const { getItemCount } = cartContext || { getItemCount: () => 0 };
    const { wishlistItems } = wishlistContext || { wishlistItems: [] };

    return (
        <footer className="text-white py-4" style={{ backgroundColor: '#1434A4' }}>
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h5 style={{ color: '#FEE055' }}>BE Updated</h5>
                        <p className="small">
                            The official e-commerce platform for National University students.
                            Shop for merchandise, uniforms, and accessories with exclusive student deals.
                        </p>
                    </div>

                    <div className="col-md-3 mb-3 mb-md-0">
                        <h5 style={{ color: '#FEE055' }}>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="text-white text-decoration-none">Home</Link></li>
                            <li><Link to="/search" className="text-white text-decoration-none">Products</Link></li>
                            {user && (
                                <>
                                    <li><Link to="/orders" className="text-white text-decoration-none">My Orders</Link></li>
                                    <li><Link to="/profile" className="text-white text-decoration-none">My Account</Link></li>
                                    <li><Link to="/wishlist" className="text-white text-decoration-none">Wishlist ({wishlistItems.length})</Link></li>
                                    <li><Link to="/cart" className="text-white text-decoration-none">Cart ({getItemCount()})</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="col-md-3 mb-3 mb-md-0">
                        <h5 style={{ color: '#FEE055' }}>Categories</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/search?q=t-shirts" className="text-white text-decoration-none">T-Shirts</Link></li>
                            <li><Link to="/search?q=uniforms" className="text-white text-decoration-none">Uniforms</Link></li>
                            <li><Link to="/search?q=accessories" className="text-white text-decoration-none">Accessories</Link></li>
                            <li><Link to="/search?q=bags" className="text-white text-decoration-none">Bags</Link></li>
                        </ul>
                    </div>

                    <div className="col-md-2">
                        <h5 style={{ color: '#FEE055' }}>Contact</h5>
                        <p className="small">
                            National University<br />
                            Fairview, Quezon City<br />
                            Philippines<br />
                        </p>
                    </div>
                </div>

                <hr className="my-3" style={{ borderColor: '#FEE055' }} />

                <div className="row align-items-center">
                    <div className="col-md-6 small">
                        &copy; {new Date().getFullYear()} National University. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
