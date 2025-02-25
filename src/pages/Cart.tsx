import React, { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import ProductContext from "../context/ProductContext"; // ✅ Import ProductContext
import { useNavigate } from "react-router-dom";
import getImageFilename from "../utils/localStorage";

const Cart: React.FC = () => {
    const { cartItems, updateCartItemQuantity, removeFromCart } = useContext(CartContext);
    const { products } = useContext(ProductContext) || { products: [] }; // ✅ Get real-time products
    const navigate = useNavigate();

    const getUniqueItemId = (item: {
        productId: string;
        selectedSize?: string;
        selectedColor?: string;
    }) => {
        return `${item.productId}-${item.selectedSize || 'nosize'}-${item.selectedColor || 'nocolor'}`;
    };

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    console.log("🛒 Cart Items:", cartItems);


    const getStockQuantity = (productId: string): number => {
        const product = products.find((p) => p.id === getImageFilename(productId).replace(".png", ""));
        return product ? product.stockQuantity : 0; // ✅ Ensures correct stock quantity updates
    };

    const toggleItemSelection = (item: { productId: string; selectedSize?: string; selectedColor?: string }) => {
        const uniqueId = getUniqueItemId(item);

        if (selectedItems.includes(uniqueId)) {
            setSelectedItems(selectedItems.filter(id => id !== uniqueId));
        } else {
            setSelectedItems([...selectedItems, uniqueId]);
        }
    };

    const selectAllItems = () => {
        const inStockItems = cartItems.filter(item => getStockQuantity(item.name) > 0);
        if (selectedItems.length === inStockItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(inStockItems.map(item => getUniqueItemId(item)));
        }
    };

    // ✅ Ensure only selected **in-stock** items are passed to Checkout.tsx
    const selectedProducts = cartItems.filter(item => {
        const uniqueId = getUniqueItemId(item);
        return selectedItems.includes(uniqueId) && getStockQuantity(item.name) > 0;
    });

    const totalPrice = selectedProducts.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <div className="container py-5">
            <h2 className="mb-4">🛒 Your Cart</h2>

            {cartItems.length === 0 ? (
                <p className="text-muted">Your cart is empty.</p>
            ) : (
                <>
                    {/* 🔹 Select All Option */}
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="selectAll"
                                checked={selectedItems.length === cartItems.filter(item => getStockQuantity(item.name) > 0).length}
                                onChange={selectAllItems}
                            />
                            <label className="form-check-label" htmlFor="selectAll">
                                Select All Available Items
                            </label>
                        </div>
                        <div>
                            <span className="me-2">{selectedItems.length} of {cartItems.length} items selected</span>
                        </div>
                    </div>

                    {/* 🔹 Cart Item List */}
                    <div className="list-group">
                        {cartItems.map((item) => {
                            const stockQuantity = getStockQuantity(item.name); // ✅ Get real-time stock updates

                            return (
                                <div key={getUniqueItemId(item)} className="list-group-item d-flex align-items-center">
                                    {/* 🔹 Selection Checkbox */}
                                    <div className="form-check me-3">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`item-${getUniqueItemId(item)}`}
                                            checked={selectedItems.includes(getUniqueItemId(item))}
                                            onChange={() => toggleItemSelection(item)}
                                            disabled={stockQuantity === 0}
                                        />
                                    </div>

                                    {/* 🔹 Product Image */}
                                    <img
                                        src={`/public/images/products/${getImageFilename(item.name)}`}
                                        alt={item.name}
                                        style={{ width: "80px", marginRight: "15px" }}
                                    />

                                    {/* 🔹 Product Details */}
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

                                        {/* 🔹 "Out of Stock" Badge */}
                                        {stockQuantity === 0 && (
                                            <p className="text-danger fw-bold">🚨 Out of Stock {stockQuantity}</p>
                                        )}

                                        {/* 🔹 Quantity Selector */}
                                        <div className="d-flex align-items-center">
                                            <button
                                                className="btn btn-outline-dark me-2"
                                                onClick={() => updateCartItemQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1 || stockQuantity === 0}
                                            >
                                                <i className="bi bi-dash"></i>
                                            </button>

                                            <span className="px-3">{item.quantity}</span>

                                            <button
                                                className="btn btn-outline-dark ms-2"
                                                onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                                                disabled={stockQuantity === 0}
                                            >
                                                <i className="bi bi-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 🔹 Remove Button */}
                                    <button className="btn btn-danger ms-3" onClick={() => removeFromCart(item.productId)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* 🔹 Total Price & Checkout Button */}
                    <div className="mt-4">
                        <h4>Selected Items Total: ₱{totalPrice.toFixed(2)}</h4>
                        <button
                            className="btn btn-success mt-2"
                            onClick={() => {
                                console.log("📌 Selected Products before navigating:", selectedProducts);
                                navigate("/checkout", { state: { selectedProducts: [...selectedProducts], isBuyNow: false } });
                            }}
                            disabled={selectedProducts.length === 0}
                        >
                            Checkout Selected Items ({selectedProducts.length})
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
