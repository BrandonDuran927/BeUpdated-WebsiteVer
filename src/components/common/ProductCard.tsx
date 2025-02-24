import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../../data/products";

interface ProductCardProps {
    product: Product;
    isInWishlist: boolean;
    onWishlistToggle: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isInWishlist, onWishlistToggle }) => {
    const { id, name, price, stockQuantity } = product;

    const rawColors = product.color ?? [];  // Changed from 'colors' to 'color'
    const rawSizes = product.size ?? [];    // Changed from 'sizes' to 'size'

    const colorList: string[] = Array.isArray(rawColors) ? [...new Set(rawColors)] : rawColors ? [rawColors] : [];
    const sizeList: string[] = Array.isArray(rawSizes) ? [...new Set(rawSizes)] : rawSizes ? [rawSizes] : [];

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="position-relative">
                <Link to={`/product/${id}`}>
                    <img
                        src={`/images/products/${id}.png`}
                        className="card-img-top"
                        alt={name}
                        style={{ height: "200px", objectFit: "cover" }}
                    />
                </Link>
                {stockQuantity < 10 && stockQuantity > 0 && (
                    <div className="position-absolute top-0 end-0 m-2 badge"
                        style={{ backgroundColor: "#FEE055", color: "#1434A4" }}>
                        Only {stockQuantity} left!
                    </div>
                )}
                {stockQuantity === 0 && (
                    <div className="position-absolute top-0 end-0 m-2 badge bg-danger">
                        Out of Stock
                    </div>
                )}
            </div>

            <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                    <Link to={`/product/${id}`} className="text-decoration-none text-dark">
                        {name}
                    </Link>
                </h5>

                <div className="text-primary fw-bold mb-2">₱{price.toFixed(2)}</div>

                <div className="small text-muted mb-2">
                    In Stock: {stockQuantity} item{stockQuantity !== 1 ? "s" : ""}
                </div>

                {/* ✅ Display Colors */}
                {colorList.length > 0 && (
                    <div className="d-flex flex-wrap mb-2">
                        <span className="fw-bold me-2">Colors:</span>
                        {colorList.map((color, index) => (
                            <div
                                key={index}
                                className="me-1 border rounded-circle"
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: color.toLowerCase(),
                                    border: "1px solid #ddd",
                                    display: "inline-block",
                                }}
                                title={color}
                            />
                        ))}
                    </div>
                )}

                {/* ✅ Display Sizes */}
                {sizeList.length > 0 && (
                    <div className="d-flex flex-wrap mb-3">
                        <span className="fw-bold me-2">Sizes:</span>
                        {sizeList.map((size, index) => (
                            <span
                                key={index}
                                className="badge bg-light text-dark me-1 mb-1 px-2"
                                style={{ border: "1px solid #ccc" }}
                            >
                                {size}
                            </span>
                        ))}
                    </div>
                )}

                <Link to={`/product/${id}`} className="btn mt-auto"
                    style={{ backgroundColor: "#1434A4", color: "#fff" }}>
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
