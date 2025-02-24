import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { firestore } from "../config/firebase";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import AuthContext from "./AuthContext"; // ✅ Import AuthContext to get logged-in user
import { Product } from "../data/products";

interface CartItem {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    price: number;
    name: string;
    savedAt: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCart: async () => { },
    removeFromCart: async () => { },
    updateCartItemQuantity: async () => { },
    clearCart: async () => { },
    getCartTotal: () => 0,
    getItemCount: () => 0,
});

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <p>Loading...</p>;
    }

    const { user } = authContext;
    const userId = user ? user.uid : null;

    // 🔹 Fetch cart from Firestore when user logs in
    useEffect(() => {
        const fetchCart = async () => {
            if (!userId) return;

            const savedProductsRef = collection(firestore, `users/${userId}/savedProducts`);
            const snapshot = await getDocs(savedProductsRef);

            const fetchedCart: CartItem[] = snapshot.docs.map(doc => ({
                productId: doc.id,
                ...doc.data(),
            })) as CartItem[];

            setCartItems(fetchedCart);
        };

        fetchCart();
    }, [userId]);

    const addToCart = async (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
        if (!userId) return;

        console.log("Adding to Cart:", product);

        const savedProductsRef = collection(firestore, `users/${userId}/savedProducts`);

        const newProductRef = doc(savedProductsRef);

        const cartItem: CartItem = {
            productId: String(newProductRef.id),
            name: product.name,
            price: product.price,
            quantity,
            selectedSize: selectedSize || '',
            selectedColor: selectedColor || '',
            savedAt: new Date().toISOString(),
        };

        console.log(`Firestore Doc ID: ${newProductRef.id}`);
        console.log(`Cart Item:`, cartItem);

        await setDoc(newProductRef, cartItem);
        setCartItems([...cartItems, cartItem]);
    };


    const removeFromCart = async (productId: string) => {
        if (!userId) return;

        const productRef = doc(firestore, `users/${userId}/savedProducts`, productId);
        await deleteDoc(productRef);
        setCartItems(cartItems.filter(item => item.productId !== productId));
    };

    const updateCartItemQuantity = async (productId: string, quantity: number) => {
        if (!userId) return;
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const productRef = doc(firestore, `users/${userId}/savedProducts`, productId);
        await setDoc(productRef, { quantity }, { merge: true }); // ✅ Update Firestore
        setCartItems(cartItems.map(item => (item.productId === productId ? { ...item, quantity } : item)));
    };

    const clearCart = async () => {
        if (!userId) return;

        const savedProductsRef = collection(firestore, `users/${userId}/savedProducts`);
        const snapshot = await getDocs(savedProductsRef);

        const batchDeletes = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(batchDeletes); // ✅ Delete all saved products from Firestore

        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, getItemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
