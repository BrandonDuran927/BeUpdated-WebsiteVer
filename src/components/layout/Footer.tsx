import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
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
                            <li><Link to="/orders" className="text-white text-decoration-none">My Orders</Link></li>
                            <li><Link to="/profile" className="text-white text-decoration-none">My Account</Link></li>
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
                            Philippines
                        </p>
                    </div>
                </div>

                <hr className="my-3" style={{ borderColor: '#FEE055' }} />

                <div className="row align-items-center">
                    <div className="col-md-6 small">
                        &copy; {new Date().getFullYear()} National University. All rights reserved.
                    </div>
                    <div className="col-md-6 text-md-end">
                        <a href="#" className="text-white me-2"><i className="bi bi-facebook"></i></a>
                        <a href="#" className="text-white me-2"><i className="bi bi-twitter"></i></a>
                        <a href="#" className="text-white me-2"><i className="bi bi-instagram"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;