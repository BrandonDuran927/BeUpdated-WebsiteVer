"use client"

import type React from "react"
import { useState, useContext } from "react"
import { useParams } from "react-router-dom"
import { getProductById } from "../data/products"
import WishlistContext from "../context/WishlistContext"
import CartContext from "../context/CartContext"
import { useNavigate } from "react-router-dom"

const ProductPage: React.FC = () => {
    const { id } = useParams()
    const product = getProductById(Number(id))
    const { addToWishlist } = useContext(WishlistContext)
    const { addToCart } = useContext(CartContext)
    const navigate = useNavigate()

    const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0])
    const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.colors?.[0])
    const [quantity, setQuantity] = useState(1)

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Product not found.
                </div>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/")}
                >
                    Return to Shop
                </button>
            </div>
        )
    }

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity)
        }
    }

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedSize, selectedColor)
        const shouldCheckout = window.confirm("Added to cart! Would you like to proceed to checkout?")
        if (shouldCheckout) {
            navigate("/checkout")
        }
    }

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
                        <div className="position-relative">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="img-fluid rounded"
                                style={{ objectFit: "cover", height: "400px", width: "100%" }}
                            />
                        </div>

                        {/* Thumbnail previews would go here */}
                        <div className="d-flex justify-content-center mt-3 gap-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="border rounded p-1 cursor-pointer"
                                    style={{ width: "60px", height: "60px" }}
                                >
                                    <img
                                        src={product.imageUrl}
                                        alt={`View ${i}`}
                                        className="img-fluid"
                                        style={{ objectFit: "cover", height: "100%", width: "100%" }}
                                    />
                                </div>
                            ))}
                        </div>
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
                            {product.oldPrice && (
                                <span className="text-muted text-decoration-line-through ms-2">
                                    ₱{product.oldPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <p className="mb-4">{product.description}</p>

                        <hr className="my-4" />

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-4">
                                <div className="d-flex align-items-center">
                                    <label className="form-label fw-bold mb-0 me-3">Size:</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {product.sizes.map((size) => (
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
                            </div>
                        )}

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-4">
                                <div className="d-flex align-items-center">
                                    <label className="form-label fw-bold mb-0 me-3">Color:</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color}
                                                className={`btn ${selectedColor === color ? "btn-dark" : "btn-outline-dark"}`}
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    position: "relative",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                <span
                                                    className="color-swatch"
                                                    style={{
                                                        display: "inline-block",
                                                        width: "1rem",
                                                        height: "1rem",
                                                        backgroundColor: color.toLowerCase(),
                                                        marginRight: "0.5rem",
                                                        borderRadius: "50%",
                                                        border: "1px solid #ddd"
                                                    }}
                                                ></span>
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center">
                                <label className="form-label fw-bold mb-0 me-3">Quantity:</label>
                                <div className="d-flex" style={{ maxWidth: "180px" }}>
                                    <button
                                        className="btn btn-outline-dark px-3"
                                        type="button"
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                    >
                                        <i className="bi bi-dash"></i>  {/* Ensure Bootstrap Icons work */}
                                    </button>

                                    <input
                                        type="number"
                                        className="form-control text-center mx-2"
                                        value={quantity}
                                        min="1"
                                        max="10"
                                        style={{ maxWidth: "50px" }}
                                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    />

                                    <button
                                        className="btn btn-outline-dark px-3"
                                        type="button"
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= 10}
                                    >
                                        <i className="bi bi-plus"></i>  {/* Ensure Bootstrap Icons work */}
                                    </button>
                                </div>
                            </div>
                            <small className="text-muted mt-2 d-block">Maximum 10 items per order</small>
                        </div>


                        {/* Action Buttons */}
                        <div className="d-grid gap-2 mt-4">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAddToCart}
                            >
                                <i className="bi bi-cart-plus me-2"></i>
                                Add to Cart
                            </button>

                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-dark flex-grow-1"
                                    onClick={() => {
                                        addToWishlist(product, selectedSize, selectedColor)
                                        navigate("/wishlist")
                                    }}
                                >
                                    <i className="bi bi-heart me-2"></i>
                                    Wishlist
                                </button>
                                <button
                                    className="btn btn-success flex-grow-1"
                                    onClick={() => {
                                        addToCart(product, quantity, selectedSize, selectedColor)
                                        navigate("/checkout")
                                    }}
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                        {/* Additional Product Info */}
                        <div className="mt-4 pt-4 border-top">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-arrow-return-left me-2 text-success"></i>
                                <span>30-day return policy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ProductPage