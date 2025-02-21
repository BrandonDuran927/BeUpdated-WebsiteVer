import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../data/products';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { id, name, price, imageUrl, stockQuantity, colors, sizes } = product;

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="position-relative">
                <Link to={`/product/${id}`}>
                    <img
                        src={imageUrl ? imageUrl : "/images/placeholder.jpg"}
                        className="card-img-top"
                        alt={name}
                        style={{ height: '200px', objectFit: 'cover' }}
                    />
                </Link>
                {stockQuantity < 10 && stockQuantity > 0 && (
                    <div
                        className="position-absolute top-0 end-0 m-2 badge"
                        style={{ backgroundColor: '#FEE055', color: '#1434A4' }}
                    >
                        Only {stockQuantity} left!
                    </div>
                )}
                {stockQuantity === 0 && (
                    <div
                        className="position-absolute top-0 end-0 m-2 badge bg-danger"
                    >
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
                    In Stock: {stockQuantity} item{stockQuantity !== 1 ? 's' : ''}
                </div>

                {colors && colors.length > 0 && (
                    <div className="d-flex flex-wrap mb-2">
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className="me-1 border rounded-circle"
                                style={{
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: color === 'Default' ? '#ccc' : color.toLowerCase(),
                                    border: '1px solid #ddd'
                                }}
                                title={color}
                            />
                        ))}
                    </div>
                )}

                {sizes && sizes.length > 0 && (
                    <div className="d-flex flex-wrap mb-3">
                        {sizes.map((size, index) => (
                            <span
                                key={index}
                                className="badge me-1 mb-1"
                                style={{ backgroundColor: '#e9ecef', color: '#000' }}
                            >
                                {size}
                            </span>
                        ))}
                    </div>
                )}

                <Link to={`/product/${id}`} className="btn mt-auto" style={{ backgroundColor: '#1434A4', color: '#fff' }}>
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;