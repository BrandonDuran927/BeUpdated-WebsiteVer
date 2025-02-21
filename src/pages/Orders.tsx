import React, { useContext } from "react";
import { Link } from "react-router-dom";
import OrderContext from "../context/OrderContext";

const Orders: React.FC = () => {
    const { orders, updateOrderStatus } = useContext(OrderContext);

    // Function to handle individual item cancellation
    const handleCancelItem = (orderId: string, productId: number, currentStatus: string) => {
        if (currentStatus === "Completed") {
            alert("You cannot cancel a completed order.");
            return;
        }
        if (currentStatus === "Cancelled") {
            alert("This item has already been cancelled.");
            return;
        }
        if (window.confirm("Are you sure you want to cancel this item?")) {
            updateOrderStatus(orderId, "Cancelled", productId)
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">📦 Your Orders</h2>

            {orders.length === 0 ? (
                <p className="text-muted">You haven't placed any orders yet.</p>
            ) : (
                <div className="list-group">
                    {orders.map((order) => (
                        <div key={order.id} className="list-group-item p-4 shadow-sm mb-3 rounded">
                            {/* Order Header */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">🆔 Order ID: {order.id}</h5>
                                <span className={`badge ${order.status === "Completed" ? "bg-success" : order.status === "Pending" ? "bg-warning" : "bg-danger"}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Order Items */}
                            {order.items.map((item) => (
                                <div key={item.productId} className="d-flex align-items-center text-dark mb-3 p-2 border rounded">
                                    {/* Product Image */}
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        style={{ width: "70px", height: "70px", borderRadius: "5px", marginRight: "15px" }}
                                    />

                                    {/* Product Details */}
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">{item.name}</h6>
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

                                    {/* Total Price */}
                                    <p className="fw-bold text-primary me-3">₱{(item.price * item.quantity).toFixed(2)}</p>

                                    {/* Cancel Item Button */}
                                    {order.status === "Pending" && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleCancelItem(order.id, item.productId, order.status)}
                                        >
                                            Cancel Item
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
