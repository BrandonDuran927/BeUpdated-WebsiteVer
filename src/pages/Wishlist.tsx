import React, { useContext } from "react";
import WishlistContext from "../context/WishlistContext";
import { Link, useNavigate } from "react-router-dom";

const Wishlist: React.FC = () => {
    const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    return (
        <div className="container py-5">
            <h2 className="mb-4">Your Wishlist</h2>
            {wishlistItems.length === 0 ? (
                <p>No items in your wishlist.</p>
            ) : (
                <div className="list-group">
                    {wishlistItems.map((item) => (
                        <div key={item.productId} className="list-group-item d-flex align-items-center">
                            <img src={item.imageUrl} alt={item.name} style={{ width: "80px", marginRight: "15px" }} />
                            <div className="flex-grow-1">
                                <h5>{item.name}</h5>
                                <p>₱{item.price.toFixed(2)}</p>
                            </div>
                            <button
                                className="btn btn-danger me-2"
                                onClick={() => removeFromWishlist(item.productId)}
                            >
                                Remove
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/product/${item.productId}`)}
                            >
                                View
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
