import React from "react";
import { useParams, Link } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
    const { orderId } = useParams();

    if (!orderId) {
        return (
            <div className="container text-center py-5">
                <h2 className="text-danger">⚠ Order ID Missing</h2>
                <p>Something went wrong. Please check your orders.</p>
                <Link to="/" className="btn btn-secondary">Go to Home</Link>
            </div>
        );
    }

    return (
        <div className="container text-center py-5">
            <h2>✅ Payment Successful!</h2>
            <p>Your order has been placed successfully.</p>
            <p><strong>Order ID:</strong> {orderId}</p>
            <Link to={`/order/${orderId}`} className="btn btn-primary">
                View Order
            </Link>
        </div>
    );
};

export default PaymentSuccess;
