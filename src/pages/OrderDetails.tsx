import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore"; // ✅ Use onSnapshot
import AuthContext from "../context/AuthContext";
import getImageFilename from "../utils/localStorage";
import OrderContext from "../context/OrderContext"; // ✅ Import OrderContext

const OrderDetails: React.FC = () => {
    const { id } = useParams();
    const authContext = useContext(AuthContext);
    const orderContext = useContext(OrderContext); // ✅ Get OrderContext

    if (!authContext || !orderContext) {
        return <p>Loading...</p>;
    }

    const { user } = authContext;
    const { updateOrderStatus } = orderContext;
    const userId = user ? user.uid : null;
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || !userId) return;

        const orderRef = doc(firestore, `users/${userId}/orders/${id}`);

        // ✅ Listen for real-time changes
        const unsubscribe = onSnapshot(orderRef, (docSnap) => {
            if (docSnap.exists()) {
                setOrder(docSnap.data());
            } else {
                console.error("⚠ Order not found in Firestore.");
                setOrder(null);
            }
            setLoading(false);
        });

        return () => unsubscribe(); // ✅ Cleanup subscription when component unmounts
    }, [id, userId]); // ✅ Dependencies include order ID and user ID

    if (loading) {
        return <p className="text-center py-5">🔄 Loading order details...</p>;
    }

    if (!order) {
        return (
            <div className="container py-5 text-center">
                <p className="text-danger">⚠ Order not found.</p>
            </div>
        );
    }

    const totalAmount = order.products.reduce((total: number, item: any) => total + item.productPrice * item.quantity, 0);

    const handleCancelItem = async (productId: string, currentStatus: string, approval: boolean) => {
        if (currentStatus === "completed") {
            alert("You cannot cancel a completed order.");
            return;
        }
        if (currentStatus === "cancelled") {
            alert("This item has already been cancelled.");
            return;
        }

        if (window.confirm("Are you sure you want to cancel this item?")) {
            await updateOrderStatus(id!, productId, "cancelled");
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">📦 Order Details</h2>

            <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: "600px" }}>
                <p><strong>Order ID:</strong> {id}</p>
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                <p><strong>Total:</strong> <span className="text-success fw-bold">₱{totalAmount.toFixed(2)}</span></p>
                <p><strong>Placed on:</strong> {new Date(order.timestamp).toLocaleDateString()}</p>
            </div>

            {/* Order Items */}
            <h3 className="mt-5 text-center">🛍 Items</h3>
            <div className="d-flex flex-column align-items-center">
                {order.products.map((item: any) => (
                    <div key={item.productId} className="d-flex align-items-center p-3 border rounded shadow-sm mb-3 w-75">
                        {/* Product Image */}
                        <img src={`/images/products/${getImageFilename(item.productName)}`} alt={item.productName} className="rounded" style={{ width: "80px", height: "80px", marginRight: "15px" }} />

                        {/* Product Details */}
                        <div className="flex-grow-1 text-center">
                            <h5 className="mb-1">{item.productName}</h5>
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

                            {/* 🔹 Product Status */}
                            <p className="mb-0">
                                <strong>Status:</strong>{" "}
                                <span className={`badge ${item.status === "completed" ? "bg-success" : item.status === "pending" ? "bg-warning" : "bg-danger"}`}>
                                    {item.status}
                                </span>
                            </p>

                            {/* 🔹 Cancellation / Pickup Time */}
                            {item.status !== "pending" && item.updatedAt && (
                                <p className="mb-0">
                                    {item.status === "cancelled" ? (
                                        <>
                                            <strong>Cancelled on:</strong> {new Date(item.updatedAt ?? "").toLocaleString()}
                                        </>
                                    ) : (
                                        <>
                                            <strong>Picked up on:</strong> {new Date(item.updatedAt ?? "").toLocaleString()}
                                        </>
                                    )}
                                </p>
                            )}

                            {/* 🔹 Approval Status (Hidden if status is cancelled) */}
                            {item.status !== "cancelled" && (
                                <p className="mb-0">
                                    <strong>Approval:</strong>{" "}
                                    {item.approval ? (
                                        <span className="badge bg-success">Approved</span>
                                    ) : (
                                        <span className="badge bg-secondary">Not Approved</span>
                                    )}
                                </p>
                            )}

                            {/* 🔹 Cancel Button */}
                            {item.status === "pending" && !item.approval && (
                                <button className="btn btn-danger btn-sm mt-2" onClick={() => handleCancelItem(item.productId, item.status, item.approval)}>
                                    Cancel Item
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderDetails;
