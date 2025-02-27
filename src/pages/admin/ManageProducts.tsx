import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { firestore } from "../../config/firebase";

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stockQuantity: number;
    description?: string;
    color?: string | string[];
    size?: string | string[];
    lastUpdated?: any;
}

const ManageProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        category: "",
        price: "",
        stockQuantity: "",
        description: "",
        color: "",
        size: ""
    });
    const [idError, setIdError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const querySnapshot = await getDocs(collection(firestore, "products"));
                const productsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(productsList);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (product: Product | null = null) => {
        setIdError("");
        if (product) {
            // For editing existing product
            setFormData({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price.toString(),
                stockQuantity: product.stockQuantity.toString(),
                description: product.description || "",
                color: Array.isArray(product.color) ? product.color.join(", ") : product.color || "",
                size: Array.isArray(product.size) ? product.size.join(", ") : product.size || ""
            });
            setSelectedProduct(product);
        } else {
            // For adding new product
            setFormData({
                id: "",
                name: "",
                category: "",
                price: "",
                stockQuantity: "",
                description: "",
                color: "",
                size: ""
            });
            setSelectedProduct(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
        setIdError("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // For productId field, only allow alphanumeric characters, hyphens, and underscores
        if (name === "id" && !selectedProduct) {
            const sanitizedValue = value.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
            setFormData({
                ...formData,
                [name]: sanitizedValue,
            });

            // Check if ID already exists
            if (sanitizedValue && products.some(product => product.id === sanitizedValue)) {
                setIdError("This product ID already exists. Please choose a different one.");
            } else {
                setIdError("");
            }
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const formatFieldValue = (value: string, isArray: boolean) => {
        if (!value.trim()) return undefined;

        if (isArray) {
            // Split by comma and trim whitespace for each item
            return value.split(',').map(item => item.trim()).filter(item => item);
        }

        return value.trim();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check for product ID if adding new product
        if (!selectedProduct && !formData.id) {
            setIdError("Product ID is required");
            return;
        }

        // Verify product ID doesn't already exist
        if (!selectedProduct && products.some(product => product.id === formData.id)) {
            setIdError("This product ID already exists. Please choose a different one.");
            return;
        }

        // Process color and size fields - convert comma-separated strings to arrays if needed
        const colorValue = formatFieldValue(formData.color, true);
        const sizeValue = formatFieldValue(formData.size, true);

        // Only include description if it has content
        const descriptionValue = formData.description.trim() || undefined;

        // Prepare product data object
        const productData = {
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.stockQuantity),
            description: descriptionValue,
            color: colorValue,
            size: sizeValue,
            lastUpdated: new Date()
        };

        try {
            if (selectedProduct) {
                // Update existing product
                await updateDoc(doc(firestore, "products", selectedProduct.id), productData);
            } else {
                // Add new product with custom ID
                await setDoc(doc(firestore, "products", formData.id), productData);
            }

            closeModal();
            // Refresh product list
            const querySnapshot = await getDocs(collection(firestore, "products"));
            const productsList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsList);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product. Please try again.");
        }
    };

    const handleDelete = async (productId: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(firestore, "products", productId));
                // Refresh product list
                const querySnapshot = await getDocs(collection(firestore, "products"));
                const productsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(productsList);
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    const tableHeaderStyle = {
        backgroundColor: '#1434A4',
        color: '#FEE055',
    };

    const categories = ["t-shirts", "accessories", "bags", "uniforms"];

    return (
        <div className="container mt-4 p-4 bg-white shadow rounded">
            <h1 className="mb-4" style={{ color: '#1434A4' }}>Manage Products</h1>
            <div className="d-flex justify-content-between mb-4">
                <div className="position-relative w-50">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="form-control"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    {searchTerm && (
                        <button
                            className="btn btn-sm position-absolute end-0 top-0 mt-1 me-2"
                            onClick={() => setSearchTerm("")}
                        >
                            <i className="bi bi-x"></i>
                            ×
                        </button>
                    )}
                </div>
                <button
                    className="btn"
                    style={{ backgroundColor: '#1434A4', color: '#FEE055' }}
                    onClick={() => openModal()}
                >
                    + Add Product
                </button>
            </div>

            {/* Scrollable table with fixed height */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive" style={{ height: '360px', overflowY: 'auto' }}>
                        <table className="table table-hover table-bordered mb-0">
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr style={tableHeaderStyle}>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center">
                                            <div className="spinner-border text-primary my-3" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            <div className="text-muted">
                                                <i className="bi bi-search fs-3 d-block mb-2"></i>
                                                No products found. Try a different search or add a new product.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="align-middle"><code>{product.id}</code></td>
                                            <td className="align-middle">{product.name}</td>
                                            <td className="align-middle">
                                                <span className="badge bg-info text-dark">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="align-middle">₱{Number(product.price).toFixed(2)}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${product.stockQuantity > 10
                                                    ? "bg-success"
                                                    : product.stockQuantity > 0
                                                        ? "bg-warning text-dark"
                                                        : "bg-danger"
                                                    }`}>
                                                    {product.stockQuantity}
                                                </span>
                                            </td>
                                            <td className="text-center align-middle">
                                                <button
                                                    className="btn btn-sm me-2"
                                                    style={{ backgroundColor: '#1434A4', color: '#FEE055' }}
                                                    onClick={() => openModal(product)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer bg-light d-flex justify-content-between align-items-center py-2">
                    <small className="text-muted">
                        Showing {filteredProducts.length} of {products.length} products
                    </small>
                    {filteredProducts.length > 0 && (
                        <small className="text-muted">
                            Scroll to see more
                        </small>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit Product */}
            {isModalOpen && (
                <div className="modal show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#f8f9fa' }}>
                                <h5 className="modal-title" style={{ color: '#1434A4' }}>
                                    {selectedProduct ? "Edit Product" : "Add Product"}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {!selectedProduct && (
                                        <div className="mb-3">
                                            <label htmlFor="id" className="form-label">Product ID*</label>
                                            <input
                                                type="text"
                                                className={`form-control ${idError ? 'is-invalid' : ''}`}
                                                id="id"
                                                name="id"
                                                value={formData.id}
                                                onChange={handleInputChange}
                                                placeholder="Enter product ID (e.g., black-tshirt, blue-cap)"
                                                required
                                                disabled={!!selectedProduct}
                                            />
                                            {idError && <div className="invalid-feedback">{idError}</div>}
                                            <small className="form-text text-muted">
                                                Use lowercase letters, numbers, hyphens, or underscores only. This will be used as the document ID in the database.
                                            </small>
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="name" className="form-label">Product Name*</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter product name"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="category" className="form-label">Category*</label>
                                            <select
                                                className="form-select"
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="" disabled>Select a category</option>
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="price" className="form-label">Price (₱)*</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="stockQuantity" className="form-label">Stock Quantity*</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="stockQuantity"
                                                name="stockQuantity"
                                                value={formData.stockQuantity}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                                min="0"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="color" className="form-label">Colors</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="color"
                                                name="color"
                                                value={formData.color}
                                                onChange={handleInputChange}
                                                placeholder="Red, Blue, Green (comma separated)"
                                            />
                                            <small className="form-text text-muted">
                                                For multiple colors, separate with commas
                                            </small>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="size" className="form-label">Sizes</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="size"
                                                name="size"
                                                value={formData.size}
                                                onChange={handleInputChange}
                                                placeholder="S, M, L, XL (comma separated)"
                                            />
                                            <small className="form-text text-muted">
                                                For multiple sizes, separate with commas
                                            </small>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Enter product description"
                                        ></textarea>
                                    </div>

                                    {selectedProduct && (
                                        <div className="alert alert-info">
                                            <small>
                                                <i className="bi bi-info-circle me-2"></i>
                                                Product ID: <code>{selectedProduct.id}</code><br />
                                                Last updated: {selectedProduct.lastUpdated
                                                    ? (selectedProduct.lastUpdated.toDate ?
                                                        selectedProduct.lastUpdated.toDate().toLocaleString() :
                                                        new Date(selectedProduct.lastUpdated).toLocaleString())
                                                    : "Never"}
                                            </small>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                    <button
                                        type="submit"
                                        className="btn"
                                        style={{ backgroundColor: '#1434A4', color: '#FEE055' }}
                                    >
                                        {selectedProduct ? "Update" : "Add"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Backdrop */}
            {isModalOpen && <div className="modal-backdrop show"></div>}
        </div>
    );
};

export default ManageProducts;