import React, { useContext } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase"; // ✅ Import Firebase Auth
import AuthContext from "../../../context/AuthContext"; // ✅ Ensure AuthContext is available

const AdminNavbar: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext); // Get auth context

    const handleLogout = async () => {
        try {
            await signOut(auth); // ✅ Logs out from Firebase
            navigate("/login"); // ✅ Redirects to login page after logout
        } catch (error) {
            console.error("❌ Error logging out:", error);
        }
    };

    return (
        <Navbar expand="lg" style={{ backgroundColor: "#1434A4" }} className="shadow-sm">
            <Container>
                {/* Logo & Brand */}
                <Navbar.Brand as={Link} to="/admin/dashboard" className="fw-bold text-light">
                    <span style={{ color: "#FEE055" }}>Admin</span> Panel
                </Navbar.Brand>

                {/* Responsive Toggle */}
                <Navbar.Toggle
                    aria-controls="admin-navbar-nav"
                    className="border-0"
                    style={{ backgroundColor: "#FEE055" }}
                />

                <Navbar.Collapse id="admin-navbar-nav">
                    <Nav className="ms-auto d-flex align-items-center gap-3">
                        <Nav.Link as={Link} to="/admin/dashboard" className="text-light fw-semibold">
                            Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/products" className="text-light fw-semibold">
                            Manage Products
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/orders" className="text-light fw-semibold">
                            Manage Orders
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/profile" className="text-light fw-semibold">
                            Profile
                        </Nav.Link>

                        {/* Logout Button (Proper Logout) */}
                        <Button variant="warning" className="fw-bold text-dark px-3 py-2" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AdminNavbar;
