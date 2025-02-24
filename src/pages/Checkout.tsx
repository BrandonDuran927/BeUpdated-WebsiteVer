import React, { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import OrderContext, { type Order } from "../context/OrderContext";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import getImageFilename from "../utils/localStorage";

interface CheckoutProduct {
    productId: string;
    name: string;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
    quantity: number;
}

const Checkout: React.FC = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const orderContext = useContext(OrderContext);
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isBuyNow: boolean = location.state?.isBuyNow || false;
    const selectedProducts: CheckoutProduct[] = location.state?.selectedProducts || [];

    const [paymentMethod, setPaymentMethod] = useState<"MASTERCARD" | "GCASH">("MASTERCARD");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [gcashNumber, setGcashNumber] = useState("");
    const [gcashAccountName, setGcashAccountName] = useState("");

    if (!orderContext || !authContext) {
        return <p>Loading...</p>;
    }

    const { placeOrder } = orderContext;
    const { user } = authContext;
    const userId = user ? user.uid : null;

    const handleCheckout = async () => {
        if (!userId) {
            alert("You must be logged in to place an order.");
            return;
        }

        if (paymentMethod === "MASTERCARD" && (!cardNumber || !expiryDate || !securityCode)) {
            alert("Please complete your MASTERCARD payment details.");
            return;
        }

        if (paymentMethod === "GCASH" && (!gcashNumber || !gcashAccountName)) {
            alert("Please complete your GCash payment details.");
            return;
        }

        const paymentMethodKey: "GCASH" | "Mastercard" = paymentMethod === "MASTERCARD" ? "Mastercard" : "GCASH";

        const orderData: Order = {
            userId,
            products: selectedProducts.map((item: CheckoutProduct) => ({
                productId: item.productId,
                productName: item.name,
                productPrice: item.price,
                productSize: item.selectedSize || "",
                productColor: item.selectedColor || "",
                quantity: item.quantity,
                savedAt: new Date().toISOString(),
                approval: false,
                status: "pending",
                updatedAt: ""
            })),
            timestamp: Date.now(),
            paymentMethod: paymentMethodKey
        };

        try {
            const orderId = await placeOrder(userId, orderData);
            if (!isBuyNow) clearCart();
            navigate(`/payment-success/${orderId}`);
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">Checkout</h2>

            {/* 🛒 Order Summary */}
            <div className="card border-0 shadow-sm p-4 mb-4">
                <h4 className="mb-3">🛒 Order Summary</h4>
                {selectedProducts.length === 0 ? (
                    <p className="text-muted">No items selected.</p>
                ) : (
                    <div className="list-group">
                        {selectedProducts.map((item: CheckoutProduct) => (
                            <div key={item.productId} className="list-group-item d-flex align-items-center">
                                <img
                                    src={`/images/products/${getImageFilename(item.name)}`}
                                    alt={item.name}
                                    style={{ width: "70px", height: "70px", marginRight: "15px", borderRadius: "5px" }}
                                />
                                <div className="flex-grow-1">
                                    <h5 className="mb-1">{item.name}</h5>
                                    {item.selectedSize && <p className="mb-0"><strong>Size:</strong> {item.selectedSize}</p>}
                                    {item.selectedColor && (
                                        <p className="mb-0">
                                            <strong>Color:</strong> <span style={{
                                                backgroundColor: item.selectedColor === "Black" ? "gray" : item.selectedColor,
                                                padding: "3px 10px",
                                                borderRadius: "5px"
                                            }}>{item.selectedColor}</span>
                                        </p>
                                    )}
                                    <p className="mb-0"><strong>Quantity:</strong> {item.quantity}</p>
                                </div>
                                <p className="fw-bold text-primary">₱{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 💳 Payment Method Selection */}
            <div className="card border-0 shadow-sm p-4">
                <h4 className="mb-3">💳 Select Payment Method</h4>
                <div className="d-flex gap-3">
                    <button className={`btn btn-outline-primary w-50 ${paymentMethod === "MASTERCARD" ? "active" : ""}`} onClick={() => setPaymentMethod("MASTERCARD")}>
                        MASTERCARD
                    </button>
                    <button className={`btn btn-outline-primary w-50 ${paymentMethod === "GCASH" ? "active" : ""}`} onClick={() => setPaymentMethod("GCASH")}>
                        GCASH
                    </button>
                </div>

                {/* MASTERCARD Payment Details */}
                {paymentMethod === "MASTERCARD" && (
                    <div className="card p-3 mt-4">
                        <h5 className="mb-3">💳 MASTERCARD Payment Details</h5>
                        <input type="text" className="form-control mb-3" placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                        <div className="d-flex gap-3">
                            <input type="text" className="form-control mb-3" placeholder="MM/YY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                            <input type="text" className="form-control mb-3" placeholder="CVV" value={securityCode} onChange={(e) => setSecurityCode(e.target.value)} />
                        </div>
                    </div>
                )}

                {/* GCash Payment Details */}
                {paymentMethod === "GCASH" && (
                    <div className="card p-3 mt-4">
                        <h5 className="mb-3">📱 GCash Payment Details</h5>
                        <input type="text" className="form-control mb-3" placeholder="Phone Number" value={gcashNumber} onChange={(e) => setGcashNumber(e.target.value)} />
                        <input type="text" className="form-control mb-3" placeholder="Account Name" value={gcashAccountName} onChange={(e) => setGcashAccountName(e.target.value)} />
                    </div>
                )}
            </div>

            {/* ✅ Confirm Order */}
            <div className="mt-4 text-end">
                <h4>Total: <span className="text-success fw-bold">₱{selectedProducts.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span></h4>
                <button className="btn btn-success mt-3 px-4 py-2" onClick={handleCheckout}>
                    Confirm Order
                </button>
            </div>
        </div>
    );
};

export default Checkout;
