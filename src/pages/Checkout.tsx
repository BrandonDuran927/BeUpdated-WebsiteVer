import React, { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import OrderContext from "../context/OrderContext";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
    const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
    const { addOrder } = useContext(OrderContext);
    const [paymentMethod, setPaymentMethod] = useState<"VISA" | "GCASH">("VISA");
    const navigate = useNavigate();

    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [gcashNumber, setGcashNumber] = useState("");
    const [gcashAccountName, setGcashAccountName] = useState("");

    const handleCheckout = () => {
        if (paymentMethod === "VISA") {
            if (!cardNumber || !expiryDate || !securityCode) {
                alert("Please complete your VISA payment details.");
                return;
            }
        } else if (paymentMethod === "GCASH") {
            if (!gcashNumber || !gcashAccountName) {
                alert("Please complete your GCash payment details.");
                return;
            }
        }

        const orderId = addOrder(paymentMethod);
        clearCart();
        navigate(`/payment-success/${orderId}`);
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">Checkout</h2>

            {/* Order Summary */}
            <div className="card border-0 shadow-sm p-4 mb-4">
                <h4 className="mb-3">🛒 Order Summary</h4>
                {cartItems.length === 0 ? (
                    <p className="text-muted">Your cart is empty.</p>
                ) : (
                    <div className="list-group">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="list-group-item d-flex align-items-center">
                                {/* Product Image */}
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    style={{ width: "70px", height: "70px", marginRight: "15px", borderRadius: "5px" }}
                                />

                                {/* Product Details */}
                                <div className="flex-grow-1">
                                    <h5 className="mb-1">{item.name}</h5>
                                    {item.selectedColor && <p className="mb-0"><strong>Size:</strong> {item.selectedSize}</p>}
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

                                {/* Item Price */}
                                <p className="fw-bold text-primary">₱{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Method */}
            <div className="card border-0 shadow-sm p-4">
                <h4 className="mb-3">💳 Select Payment Method</h4>
                <div className="d-flex gap-3">
                    <label className={`btn btn-outline-primary w-50 ${paymentMethod === "VISA" ? "active" : ""}`} onClick={() => setPaymentMethod("VISA")}>
                        <img src="/public/images/products/mastercardlogo.png" alt="Visa" style={{ width: "40px", marginRight: "10px" }} />
                        Mastercard
                    </label>
                    <label className={`btn btn-outline-primary w-50 ${paymentMethod === "GCASH" ? "active" : ""}`} onClick={() => setPaymentMethod("GCASH")}>
                        <img src="/public/images/products/gcashlogo.png" alt="GCash" style={{ width: "40px", marginRight: "10px" }} />
                        GCASH
                    </label>
                </div>

                {/* Payment Details Form */}
                <div className="mt-4">
                    {paymentMethod === "VISA" && (
                        <div className="card p-3">
                            <h5 className="mb-3">💳 Mastercard Payment Details</h5>
                            <div className="mb-3">
                                <label className="form-label">Card Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={16}
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                />
                            </div>
                            <div className="d-flex gap-3">
                                <div className="mb-3 w-50">
                                    <label className="form-label">Expiration Date</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3 w-50">
                                    <label className="form-label">Security Code (CVV)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="123"
                                        maxLength={3}
                                        value={securityCode}
                                        onChange={(e) => setSecurityCode(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === "GCASH" && (
                        <div className="card p-3">
                            <h5 className="mb-3">📱 GCash Payment Details</h5>
                            <div className="mb-3">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="09XX XXX XXXX"
                                    pattern="^09\d{9}$"
                                    value={gcashNumber}
                                    onChange={(e) => setGcashNumber(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Account Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Sam Lou"
                                    value={gcashAccountName}
                                    onChange={(e) => setGcashAccountName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Total & Confirm Order */}
            <div className="mt-4 text-end">
                <h4>Total: <span className="text-success fw-bold">₱{getCartTotal().toFixed(2)}</span></h4>
                <button className="btn btn-success mt-3 px-4 py-2" onClick={handleCheckout} disabled={cartItems.length === 0}>
                    Confirm Order
                </button>
            </div>
        </div>
    );
};

export default Checkout;
