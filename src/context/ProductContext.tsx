import React, { createContext, useEffect, useState, ReactNode } from "react";
import { firestore } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export interface Product {
    id: string;
    name: string;
    category: string;
    color: string | string[];
    size?: string | string[];
    description: string;
    lastUpdated: string;
    price: number;
    stockQuantity: number;
    imageUrl: string;
}


interface ProductContextType {
    products: Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const productsRef = collection(firestore, "products");

        // ✅ Listen for real-time changes
        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const productList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];
            setProducts(productList);
        });

        return () => unsubscribe(); // ✅ Cleanup listener when component unmounts
    }, []);

    return (
        <ProductContext.Provider value={{ products }}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContext;
