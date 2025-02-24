import React, { createContext, useEffect, useState, ReactNode } from "react";
import { firestore } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Product {
    id: string;
    name: string;
    category: string;
    color: string | string[];
    size?: string | string[];
    description: string;
    lastUpdated: string;
    price: number;
    stockQuantity: number;
}

interface ProductContextType {
    products: Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const querySnapshot = await getDocs(collection(firestore, "products"));
            const productList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];
            setProducts(productList);
        };

        fetchProducts();
    }, []);

    return (
        <ProductContext.Provider value={{ products }}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContext;
