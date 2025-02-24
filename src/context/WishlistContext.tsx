import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { firestore } from "../config/firebase";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import AuthContext from "./AuthContext"; // ✅ Import AuthContext to get logged-in user
import { Product } from "../data/products";

interface WishlistItem {
    productId: string;
    selectedSize?: string;
    selectedColor?: string;
    name: string;
    price: number;
    addedAt: string;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (product: Product, selectedSize?: string, selectedColor?: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlistItems: [],
    addToWishlist: async () => { },
    removeFromWishlist: async () => { },
    isInWishlist: () => false,
    clearWishlist: async () => { },
});

interface WishlistProviderProps {
    children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <p>Loading...</p>;
    }

    const { user } = authContext;
    const userId = user ? user.uid : null;

    // 🔹 Fetch wishlist from Firestore when user logs in
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!userId) return;

            const wishlistRef = collection(firestore, `users/${userId}/wishlist`);
            const snapshot = await getDocs(wishlistRef);

            const fetchedWishlist: WishlistItem[] = snapshot.docs.map(doc => ({
                productId: doc.id, // Firestore document ID == productId
                ...doc.data(),
            })) as WishlistItem[];

            setWishlistItems(fetchedWishlist);
        };

        fetchWishlist();
    }, [userId]);

    const addToWishlist = async (product: Product, selectedSize?: string, selectedColor?: string) => {
        if (!userId) {
            console.error("❌ No user ID found! User must be logged in.");
            return;
        }

        try {
            const wishlistRef = collection(firestore, `users/${userId}/wishlist`);

            // 🔹 Generate a new Firestore document reference with a unique ID
            const newWishlistRef = doc(wishlistRef);
            const generatedId = newWishlistRef.id; // ✅ Firestore-generated ID

            const newWishlistItem: WishlistItem = {
                productId: generatedId, // ✅ Assign Firestore-generated ID
                name: product.name || "Unknown Product",
                price: product.price ?? 0,
                selectedSize: selectedSize || "",
                selectedColor: selectedColor || "",
                addedAt: new Date().toISOString(),
            };

            console.log("🔥 Adding to wishlist:", newWishlistItem);
            console.log("📂 Firestore Path:", newWishlistRef.path);
            console.log(`✅ Generated Wishlist Doc ID: ${generatedId}`);

            // 🔹 Save item to Firestore using the generated document ID
            await setDoc(newWishlistRef, newWishlistItem);
            console.log(`✅ Wishlist item added! Document ID: ${generatedId}`);

            // 🔹 Update local state with the new wishlist item
            setWishlistItems([...wishlistItems, newWishlistItem]);

        } catch (error) {
            console.error("❌ Error adding to wishlist:", error);
        }
    };


    const removeFromWishlist = async (productId: string) => {
        if (!userId) return;

        const wishlistRef = doc(firestore, `users/${userId}/wishlist`, productId);
        await deleteDoc(wishlistRef);

        setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
    };

    const isInWishlist = (productId: string): boolean => {
        return wishlistItems.some(item => item.productId === productId);
    };

    const clearWishlist = async () => {
        if (!userId) return;

        const wishlistRef = collection(firestore, `users/${userId}/wishlist`);
        const snapshot = await getDocs(wishlistRef);

        const batchDeletes = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(batchDeletes); // ✅ Delete all wishlist items from Firestore

        setWishlistItems([]);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
