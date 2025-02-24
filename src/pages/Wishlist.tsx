import React, { useContext, useEffect, useState } from "react";
import WishlistContext from "../context/WishlistContext";
import { Link, useNavigate } from "react-router-dom";
import { firestore } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import getImageFilename from "../utils/localStorage";

const Wishlist: React.FC = () => {
    const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, "users/UID/wishlist"));
                if (querySnapshot.empty) {
                    console.log("No wishlist items found.");
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching wishlist:", error);
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    return (
        <div className="container py-5">
            <h2 className="mb-4">Your Wishlist</h2>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : wishlistItems.length === 0 ? (
                <p>No items in your wishlist.</p>
            ) : (
                <div className="list-group">
                    {wishlistItems.map((item) => (
                        <div key={item.productId} className="list-group-item d-flex align-items-center">
                            <img
                                src={`/public/images/products/${getImageFilename(item.name)}`}
                                alt={item.name}
                                style={{ width: "80px", marginRight: "15px" }}
                            />
                            <div className="flex-grow-1">
                                <h5>{item.name}</h5>
                                <p>₱{item.price.toFixed(2)}</p>
                                {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                                {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                            </div>
                            <button
                                className="btn btn-danger me-2"
                                onClick={() => removeFromWishlist(item.productId)}
                            >
                                <i className="bi bi-trash"></i> Remove
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    navigate(`/product/${getImageFilename(item.name).replace(".png", "")}`)
                                    console.log(getImageFilename(item.name).replace(".png", ""))
                                }}
                            >
                                <i className="bi bi-eye"></i> View
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
