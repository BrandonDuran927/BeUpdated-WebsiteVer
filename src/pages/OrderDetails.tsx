import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import OrderContext from "../context/OrderContext";

const OrderDetails: React.FC = () => {
    const { id } = useParams();
    const { getOrderById } = useContext(OrderContext);
    const order = getOrderById(id || "");

    if (!order) {
        return (
            <div className="container py-5 text-center">
                <p className="text-danger">⚠ Order not found.</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">📦 Order Details</h2>

            <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: "600px" }}>
                <p><strong>Order ID:</strong> {order.id}</p>
                <p>
                    <strong>Status:</strong>{" "}
                    <span className={`badge ${order.status === "Completed" ? "bg-success" : order.status === "Pending" ? "bg-warning text-dark" : "bg-danger"}`}>
                        {order.status}
                    </span>
                </p>
                <p><strong>Total:</strong> <span className="text-success fw-bold">₱{order.total.toFixed(2)}</span></p>
                <p><strong>Placed on:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Order Items */}
            <h3 className="mt-5 text-center">🛍 Items</h3>
            <div className="d-flex flex-column align-items-center">
                {order.items.map((item) => (
                    <div key={item.productId} className="d-flex align-items-center p-3 border rounded shadow-sm mb-3 w-75">
                        {/* Product Image */}
                        <img src={item.imageUrl} alt={item.name} className="rounded" style={{ width: "80px", height: "80px", marginRight: "15px" }} />

                        {/* Product Details */}
                        <div className="flex-grow-1 text-center">
                            <h5 className="mb-1">{item.name}</h5>
                            {item.selectedSize && <p className="mb-0"><strong>Size:</strong> {item.selectedSize}</p>}
                            {item.selectedColor && (
                                <p className="mb-0">
                                    <strong>Color:</strong>{" "}
                                    <span style={{
                                        backgroundColor: item.selectedColor === "Black" ? "gray" : item.selectedColor,
                                        padding: "3px 10px",
                                        borderRadius: "5px"
                                    }}>{item.selectedColor}</span>
                                </p>
                            )}
                            <p className="mb-0"><strong>Quantity:</strong> {item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderDetails;
