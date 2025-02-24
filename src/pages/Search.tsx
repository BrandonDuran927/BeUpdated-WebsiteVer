import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../data/products";
import ProductCard from "../components/common/ProductCard";
import { Product } from "../data/products";
import WishlistContext from "../context/WishlistContext";

const Search: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            const results = await searchProducts(query);
            setSearchResults(results);
            setLoading(false);
        };

        fetchResults();
    }, [query]);

    return (
        <div className="container py-5">
            <h2 className="mb-3">🔎 Search Results for "{query}"</h2>

            {loading ? (
                <p>🔄 Loading results...</p>
            ) : searchResults.length === 0 ? (
                <p className="text-muted">⚠ No products found.</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {searchResults.map((product) => (
                        <div key={product.id} className="col">
                            <ProductCard
                                product={product}
                                isInWishlist={isInWishlist(product.id)} // ✅ Show wishlist status
                                onWishlistToggle={() =>
                                    isInWishlist(product.id)
                                        ? removeFromWishlist(product.id)
                                        : addToWishlist(product)
                                }
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
