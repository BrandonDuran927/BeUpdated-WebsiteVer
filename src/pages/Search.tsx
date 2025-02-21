import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../data/products";
import ProductCard from "../components/common/ProductCard";
import { Product } from "../data/products";

const Search: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [searchResults, setSearchResults] = useState<Product[]>([]);

    useEffect(() => {
        setSearchResults(searchProducts(query));
    }, [query]);

    return (
        <div className="container py-5">
            <h2>Search Results for "{query}"</h2>
            {searchResults.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {searchResults.map((product) => (
                        <div key={product.id} className="col">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
