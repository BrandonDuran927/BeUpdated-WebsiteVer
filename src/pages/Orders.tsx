import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import OrderContext from "../context/OrderContext";
import getImageFilename from "../utils/localStorage";

const Orders: React.FC = () => {
    const orderContext = useContext(OrderContext);
    const navigate = useNavigate();

    if (!orderContext) {
        return <p>Loading orders...</p>;
    }

    const { orders, updateOrderStatus } = orderContext;

    const handleCancelItem = (orderId: string, productId: string, productStatus: string) => {
        if (productStatus === "completed") {
            alert("You cannot cancel a completed order.");
            return;
        }
        if (productStatus === "cancelled") {
            alert("This item has already been cancelled.");
            return;
        }
        if (window.confirm("Are you sure you want to cancel this item?")) {
            updateOrderStatus(orderId, productId, "cancelled");
        }
    };

    // ✅ Sort orders based on the most recent `savedAt` product
    const sortedOrders = [...orders].sort((a, b) => {
        const latestProductA = Math.max(...a.products.map(product => new Date(product.savedAt).getTime()));
        const latestProductB = Math.max(...b.products.map(product => new Date(product.savedAt).getTime()));
        return latestProductB - latestProductA; // Descending order (newest first)
    });

    return (
        <div className="container py-5">
            <h2 className="mb-4">📦 Your Orders</h2>

            {sortedOrders.length === 0 ? (
                <p className="text-muted">You haven't placed any orders yet.</p>
            ) : (
                <div className="list-group">
                    {sortedOrders.map((order) => (
                        <div key={order.id} className="list-group-item p-4 shadow-sm mb-3 rounded">
                            {/* Order Header */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">🆔 Order ID: {order.id}</h5>
                                <span className="badge bg-info">Payment: {order.paymentMethod}</span>
                            </div>

                            {/* Order Items */}
                            {order.products
                                .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()) // ✅ Sort products inside each order
                                .map((item) => (
                                    <div key={item.productId} className="d-flex align-items-center text-dark mb-3 p-2 border rounded">
                                        <img
                                            src={`/public/images/products/${getImageFilename(item.productName)}` || "/default-image.png"}
                                            alt={item.productName}
                                            style={{ width: "70px", height: "70px", borderRadius: "5px", marginRight: "15px" }}
                                        />

                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">{item.productName}</h6>
                                            {item.productSize && <p className="mb-0"><strong>Size:</strong> {item.productSize}</p>}
                                            {item.productColor && (
                                                <p className="mb-0">
                                                    <strong>Color:</strong>{" "}
                                                    <span style={{
                                                        backgroundColor: item.productColor === "Black" ? "gray" : item.productColor,
                                                        padding: "3px 10px",
                                                        borderRadius: "5px"
                                                    }}>{item.productColor}</span>
                                                </p>
                                            )}
                                            <p className="mb-0"><strong>Quantity:</strong> {item.quantity}</p>

                                            {/* 🔹 Status Indicator */}
                                            <p className="mb-0">
                                                <strong>Status:</strong>{" "}
                                                <span className={`badge ${item.status === "completed" ? "bg-success" : item.status === "pending" ? "bg-warning" : "bg-danger"}`}>
                                                    {item.status}
                                                </span>
                                            </p>

                                            {/* 🔹 Display Cancellation or Pickup Time */}
                                            {item.status !== "pending" && item.updatedAt && (
                                                <p className="mb-0" style={{ fontSize: "0.85rem" }}>
                                                    {item.status === "cancelled"
                                                        ? <strong>Cancelled on:</strong>
                                                        : <strong>Picked up on:</strong>}{" "}
                                                    {new Date(item.updatedAt).toLocaleString()}
                                                </p>
                                            )}

                                            {/* 🔹 Timestamp (Saved At) */}
                                            <p className="mb-0" style={{ fontSize: "0.85rem" }}>
                                                <strong>Ordered on:</strong> {new Date(item.savedAt).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* 🔹 Cancel Button for Individual Items */}
                                        {item.status === "pending" && !item.approval && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleCancelItem(order.id!, item.productId, item.status)}
                                            >
                                                Cancel Item
                                            </button>
                                        )}
                                    </div>
                                ))
                            }

                            {/* 🔹 View Order Button */}
                            <div className="mt-3 text-end">
                                <button className="btn btn-primary" onClick={() => navigate(`/order/${order.id}`)}>
                                    View Order Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
