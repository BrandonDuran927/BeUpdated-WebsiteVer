import React from "react";
import { useParams, Link } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
    const { orderId } = useParams();

    return (
        <div className="container text-center py-5">
            <h2>Payment Successful!</h2>
            <p>Your order has been placed successfully.</p>
            <p><strong>Order ID:</strong> {orderId}</p>
            <Link to={`/order/${orderId}`} className="btn btn-primary">
                View Order
            </Link>
        </div>
    );
};

export default PaymentSuccess;
