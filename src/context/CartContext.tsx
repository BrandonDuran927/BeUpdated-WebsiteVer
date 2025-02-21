import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem {
    productId: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    price: number;
    name: string;
    imageUrl: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
    removeFromCart: (productId: number) => void;
    updateCartItemQuantity: (productId: number, quantity: number) => void; // ✅ Renamed here
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateCartItemQuantity: () => { }, // ✅ Renamed here
    clearCart: () => { },
    getCartTotal: () => 0,
    getItemCount: () => 0
});

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (
        product: Product,
        quantity: number,
        selectedSize?: string,
        selectedColor?: string
    ) => {
        const existingItemIndex = cartItems.findIndex(
            item =>
                item.productId === product.id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
        );

        if (existingItemIndex >= 0) {
            const updatedItems = [...cartItems];
            updatedItems[existingItemIndex].quantity += quantity;
            setCartItems(updatedItems);
        } else {
            setCartItems([
                ...cartItems,
                {
                    productId: product.id,
                    quantity,
                    selectedSize,
                    selectedColor,
                    price: product.price,
                    name: product.name,
                    imageUrl: product.imageUrl
                }
            ]);
        }
    };

    const removeFromCart = (productId: number) => {
        setCartItems(cartItems.filter(item => item.productId !== productId));
    };

    const updateCartItemQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(
            cartItems.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateCartItemQuantity,
                clearCart,
                getCartTotal,
                getItemCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
