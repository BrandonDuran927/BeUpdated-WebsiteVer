import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';

interface WishlistItem {
    productId: number;
    selectedSize?: string;
    selectedColor?: string;
    name: string;
    price: number;
    imageUrl: string;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (product: Product, selectedSize?: string, selectedColor?: string) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlistItems: [],
    addToWishlist: () => { },
    removeFromWishlist: () => { },
    isInWishlist: () => false,
    clearWishlist: () => { }
});

interface WishlistProviderProps {
    children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

    useEffect(() => {
        // Load wishlist from localStorage on mount
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
        }
    }, []);

    useEffect(() => {
        // Save wishlist to localStorage whenever it changes
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (
        product: Product,
        selectedSize?: string,
        selectedColor?: string
    ) => {
        // Check if item already exists in wishlist
        const existingItem = wishlistItems.find(
            item =>
                item.productId === product.id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
        );

        if (!existingItem) {
            setWishlistItems([
                ...wishlistItems,
                {
                    productId: product.id,
                    selectedSize,
                    selectedColor,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl
                }
            ]);
        }
    };

    const removeFromWishlist = (productId: number) => {
        setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
    };

    const isInWishlist = (productId: number): boolean => {
        return wishlistItems.some(item => item.productId === productId);
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;