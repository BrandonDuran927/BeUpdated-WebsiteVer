import React from "react";
import { Container } from "react-bootstrap";

const AdminFooter: React.FC = () => {
    return (
        <footer style={{ backgroundColor: "#FEE055", color: "#1434A4" }} className="text-center py-3 mt-4 shadow-sm">
            <Container>
                <p className="mb-0 fw-bold">&copy; {new Date().getFullYear()} Admin Panel | All Rights Reserved</p>
            </Container>
        </footer>
    );
};

export default AdminFooter;
