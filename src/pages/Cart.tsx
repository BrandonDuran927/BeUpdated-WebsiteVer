import React, { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart: React.FC = () => {
    const { cartItems, updateCartItemQuantity, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();

    const getUniqueItemId = (item: {
        productId: number;
        selectedSize?: string;
        selectedColor?: string;
    }) => {
        return `${item.productId}-${item.selectedSize || 'nosize'}-${item.selectedColor || 'nocolor'}`;
    };

    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleItemSelection = (item: {
        productId: number;
        selectedSize?: string;
        selectedColor?: string;
    }) => {
        const uniqueId = getUniqueItemId(item);

        if (selectedItems.includes(uniqueId)) {
            setSelectedItems(selectedItems.filter(id => id !== uniqueId));
        } else {
            setSelectedItems([...selectedItems, uniqueId]);
        }
    };

    const selectAllItems = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => getUniqueItemId(item)));
        }
    };

    const totalPrice = cartItems
        .filter(item => selectedItems.includes(getUniqueItemId(item)))
        .reduce((total, item) => total + item.price * item.quantity, 0);

    const getSelectedProductIds = () => {
        return cartItems
            .filter(item => selectedItems.includes(getUniqueItemId(item)))
            .map(item => item.productId);
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">🛒 Your Cart</h2>

            {cartItems.length === 0 ? (
                <p className="text-muted">Your cart is empty.</p>
            ) : (
                <>
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="selectAll"
                                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                onChange={selectAllItems}
                            />
                            <label className="form-check-label" htmlFor="selectAll">
                                Select All Items
                            </label>
                        </div>
                        <div>
                            <span className="me-2">{selectedItems.length} of {cartItems.length} items selected</span>
                        </div>
                    </div>

                    <div className="list-group">
                        {cartItems.map((item) => (
                            <div key={getUniqueItemId(item)} className="list-group-item d-flex align-items-center">
                                {/* Selection Checkbox */}
                                <div className="form-check me-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`item-${getUniqueItemId(item)}`}
                                        checked={selectedItems.includes(getUniqueItemId(item))}
                                        onChange={() => toggleItemSelection(item)}
                                    />
                                </div>

                                {/* Product Image */}
                                <img src={item.imageUrl} alt={item.name} style={{ width: "80px", marginRight: "15px" }} />

                                {/* Product Details */}
                                <div className="flex-grow-1">
                                    <h5>{item.name}</h5>
                                    <p>₱{item.price.toFixed(2)}</p>
                                    {item.selectedSize && <p><strong>Size:</strong> {item.selectedSize}</p>}
                                    {item.selectedColor && (
                                        <p>
                                            <strong>Color:</strong> <span style={{
                                                backgroundColor: item.selectedColor === "Black" ? "gray" : item.selectedColor,
                                                padding: "3px 10px",
                                                borderRadius: "5px"
                                            }}>{item.selectedColor}</span>
                                        </p>
                                    )}

                                    {/* Quantity Selector */}
                                    <div className="flex-grow-1">
                                        <button
                                            className="btn btn-outline-dark"
                                            onClick={() => updateCartItemQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                            disabled={item.quantity <= 1}
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>

                                        <span className="px-3">{item.quantity}</span>

                                        <button
                                            className="btn btn-outline-dark"
                                            onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button className="btn btn-danger ms-3" onClick={() => removeFromCart(item.productId)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Total Price & Checkout Button */}
                    <div className="mt-4">
                        <h4>Selected Items Total: ₱{totalPrice.toFixed(2)}</h4>
                        <button
                            className="btn btn-success mt-2"
                            onClick={() => navigate("/checkout", { state: { selectedItems: getSelectedProductIds() } })}
                            disabled={selectedItems.length === 0}
                        >
                            Checkout Selected Items ({selectedItems.length})
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;