import React, { createContext, ReactNode, useEffect, useState, useContext } from "react";
import { firestore } from "../config/firebase";
import { collection, addDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import AuthContext from "./AuthContext";
import { getDoc } from "firebase/firestore";


export interface OrderItem {
    productId: string;
    productName: string;
    productPrice: number;
    productSize?: string;
    productColor?: string;
    quantity: number;
    savedAt: string;
    approval: boolean;
    status: "pending" | "cancelled" | "completed";
    updatedAt: string;
}

export interface Order {
    id?: string;
    userId: string;
    products: OrderItem[];
    timestamp: number;
    paymentMethod: "GCASH" | "Mastercard";
}

interface OrderContextType {
    orders: Order[];
    placeOrder: (userId: string, orderData: Order) => Promise<string>;
    updateOrderStatus: (orderId: string, productId: string, status: "pending" | "cancelled" | "completed") => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <p>Loading...</p>;
    }

    const { user } = authContext;
    const userId = user ? user.uid : null;

    // 🔹 Listen for real-time updates on orders
    useEffect(() => {
        if (!userId) return;

        const ordersRef = collection(firestore, `users/${userId}/orders`);

        // ✅ Subscribe to Firestore changes
        const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
            const updatedOrders: Order[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Order[];

            setOrders(updatedOrders);
            console.log("📦 Orders updated in real-time:", updatedOrders);
        });

        return () => unsubscribe();
    }, [userId]);

    const placeOrder = async (userId: string, orderData: Order): Promise<string> => {
        try {
            const ordersRef = collection(firestore, `users/${userId}/orders`);
            const docRef = await addDoc(ordersRef, orderData);

            console.log("✅ Order successfully placed with ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("❌ Error placing order:", error);
            throw new Error("Failed to place order");
        }
    };

    const updateOrderStatus = async (
        orderId: string,
        productId: string,
        newStatus: "pending" | "cancelled" | "completed"
    ) => {
        try {
            if (!userId) {
                console.error("❌ No user ID found.");
                return;
            }

            const orderRef = doc(firestore, `users/${userId}/orders/${orderId}`);

            const orderSnap = await getDoc(orderRef);

            if (!orderSnap.exists()) {
                console.error("❌ Order not found in Firestore.");
                return;
            }

            const orderData = orderSnap.data() as Order;

            const updatedProducts = orderData.products.map(product =>
                product.productId === productId
                    ? {
                        ...product,
                        status: newStatus,
                        approval: newStatus !== "cancelled",
                        updatedAt: new Date().toISOString(),
                    }
                    : product
            );

            await updateDoc(orderRef, { products: updatedProducts });

            console.log(`✅ Updated product ${productId} in order ${orderId} to status: ${newStatus}`);
        } catch (error) {
            console.error("❌ Error updating order status:", error);
        }
    };


    return (
        <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderContext;
