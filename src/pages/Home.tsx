import React, { useState, useContext } from "react";
import ProductContext, { Product } from "../context/ProductContext"; // ✅ Use ProductContext
import ProductCard from "../components/common/ProductCard";

const Home: React.FC = () => {
    const { products } = useContext(ProductContext) || { products: [] }; // ✅ Get real-time products
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const categories = ["All", "t-shirts", "accessories", "bags", "uniforms"];

    // ✅ Filter products based on category
    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter((p: Product) => p.category.toLowerCase().trim() === selectedCategory);

    return (
        <div className="container py-5">
            {/* Jumbotron */}
            <div className="jumbotron mb-5 p-5 rounded" style={{ backgroundColor: "#1434A4" }}>
                <div className="row align-items-center">
                    <div className="col-md-6 text-white">
                        <h1 className="display-4 fw-bold" style={{ color: "#FEE055" }}>Welcome to BEUpdated</h1>
                        <p className="lead">Shop the latest NU Fairview merchandise and uniforms exclusively for students.</p>
                        <hr className="my-4" style={{ borderColor: "#FEE055" }} />
                        <p>Get exclusive deals and convenient campus pickup for all your university needs.</p>
                    </div>
                    <div className="col-md-6 text-center">
                        <img
                            src="/public/images/products/beupdatedlogo.jpg"
                            alt="BEUpdated Logo"
                            className="img-fluid"
                            style={{ maxHeight: "300px" }}
                        />
                    </div>
                </div>
            </div>

            {/* Category Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-4">Products</h2>
                    <div className="d-flex flex-wrap justify-content-center mb-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`btn me-2 mb-2 ${selectedCategory === category ? "btn-primary" : "btn-outline-primary"}`}
                                style={
                                    selectedCategory === category
                                        ? { backgroundColor: "#1434A4", borderColor: "#1434A4", color: "#FEE055" }
                                        : { backgroundColor: "transparent", borderColor: "#1434A4", color: "#1434A4" }
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products List */}
            {products.length === 0 ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {filteredProducts.map((product: Product) => (
                        <div key={product.id} className="col">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="alert alert-info text-center">
                    No products found in this category.
                </div>
            )}
        </div>
    );
};

export default Home;
