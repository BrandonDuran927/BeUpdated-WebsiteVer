"use client";

import type React from "react";
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";
import WishlistContext from "../context/WishlistContext";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";

const ProductPage: React.FC = () => {
    const { id } = useParams();
    const { addToWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const [product, setProduct] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string | undefined>();
    const [selectedColor, setSelectedColor] = useState<string | undefined>();
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const productRef = doc(firestore, `products/${id}`);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const fetchedProduct = productSnap.data();

                    // 🔹 Convert size and color to arrays (handling both string and array cases)
                    const sizes = fetchedProduct.size
                        ? Array.isArray(fetchedProduct.size)
                            ? fetchedProduct.size
                            : [fetchedProduct.size]
                        : [];

                    const colors = fetchedProduct.color
                        ? Array.isArray(fetchedProduct.color)
                            ? fetchedProduct.color
                            : [fetchedProduct.color]
                        : [];

                    setProduct({ ...fetchedProduct, sizes, colors });

                    // ✅ Set default selections
                    setSelectedSize(sizes.length > 0 ? sizes[0] : undefined);
                    setSelectedColor(colors.length > 0 ? colors[0] : undefined);
                } else {
                    console.log("Product not found in Firestore.");
                    setProduct(null);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading || !authContext) {
        return <p className="text-center py-5">Loading product...</p>;
    }

    const { user } = authContext;

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Product not found.
                </div>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
                    Return to Shop
                </button>
            </div>
        );
    }

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert("You need to log in first!");
            navigate("/login");
            return;
        }

        try {
            await addToCart(product, quantity, selectedSize, selectedColor);
            const shouldCheckout = window.confirm("Added to cart! Would you like to proceed to checkout?");
            if (shouldCheckout) {
                navigate("/checkout");
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
            alert("Failed to add product to cart. Please try again.");
        }
    };

    const handleBuyNow = () => {
        if (!user) {
            alert("You need to log in first!");
            navigate("/login");
            return;
        }

        navigate("/checkout", {
            state: {
                selectedProducts: [{ // ✅ Ensure it passes a single product as an array
                    productId: id,
                    name: product.name,
                    price: product.price,
                    selectedSize,
                    selectedColor,
                    quantity,
                }],
                isBuyNow: true, // ✅ Mark as Buy Now
            },
        });
    };


    const handleAddToWishlist = () => {
        addToWishlist(product, selectedSize, selectedColor);
        navigate("/wishlist");
    };

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Home</a></li>
                    <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
                </ol>
            </nav>

            <div className="row g-4">
                {/* Product Image Gallery */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <img
                            src={`/images/products/${id}.png`}
                            alt={id}
                            className="img-fluid rounded"
                            style={{
                                minHeight: "300px",
                                maxHeight: "500px",
                                objectFit: "contain",
                                width: "100%",
                            }}
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4">
                        <h1 className="h3 fw-bold mb-2">{product.name}</h1>
                        <div className="d-flex align-items-center mb-3">
                            <span className="badge bg-success">In Stock</span>
                        </div>

                        <div className="mb-4">
                            <h2 className="h1 fw-bold text-primary mb-0">₱{product.price.toFixed(2)}</h2>
                        </div>

                        <p className="mb-4">{product.description}</p>

                        <hr className="my-4" />

                        {/* Size Selection */}
                        {product.sizes.length > 0 && (
                            <div className="mb-4">
                                <label className="form-label fw-bold">Size:</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {product.sizes.map((size: string) => (
                                        <button
                                            key={size}
                                            className={`btn ${selectedSize === size ? "btn-dark" : "btn-outline-dark"}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {product.colors.length > 0 && (
                            <div className="mb-4">
                                <label className="form-label fw-bold">Color:</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {product.colors.map((color: string) => (
                                        <button
                                            key={color}
                                            className={`btn ${selectedColor === color ? "btn-dark text-white" : "btn-outline-dark"}`}
                                            onClick={() => setSelectedColor(color)}
                                            style={{
                                                borderColor: color.toLowerCase(),
                                                backgroundColor: selectedColor === color ? color.toLowerCase() : "white",
                                                color: selectedColor === color ? "white" : "black",
                                            }}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selection */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Quantity:</label>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="btn btn-outline-dark"
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={quantity <= 1}
                                >
                                    <i className="bi bi-dash"></i>
                                </button>
                                <span className="fw-bold px-3">{quantity}</span>
                                <button
                                    className="btn btn-outline-dark"
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={quantity >= 10}
                                >
                                    <i className="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>


                        {/* Buttons */}
                        <div className="d-grid gap-2 mt-4">
                            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                <i className="bi bi-cart-plus me-2"></i> Add to Cart
                            </button>
                            <button className="btn btn-success btn-lg" onClick={handleBuyNow}>
                                Buy Now
                            </button>
                            <button className="btn btn-outline-dark btn-lg" onClick={handleAddToWishlist}>
                                <i className="bi bi-heart me-2"></i> Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
