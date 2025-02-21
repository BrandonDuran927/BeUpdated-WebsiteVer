import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import CartContext from './CartContext';

export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    imageUrl: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    createdAt: string;
    paymentMethod: 'VISA' | 'GCASH';
}

interface OrderContextType {
    orders: Order[];
    addOrder: (paymentMethod: 'VISA' | 'GCASH') => string;
    getOrderById: (id: string) => Order | undefined;
    updateOrderStatus: (id: string, status: OrderStatus, productId?: number) => void;
}

const OrderContext = createContext<OrderContextType>({
    orders: [],
    addOrder: () => '',
    getOrderById: () => undefined,
    updateOrderStatus: () => { }
});

interface OrderProviderProps {
    children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const { cartItems, getCartTotal, clearCart } = useContext(CartContext);

    useEffect(() => {
        // Load orders from localStorage on mount
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            setOrders(JSON.parse(savedOrders));
        }
    }, []);

    useEffect(() => {
        // Save orders to localStorage whenever it changes
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    const addOrder = (paymentMethod: 'VISA' | 'GCASH'): string => {
        if (cartItems.length === 0) return '';

        const orderItems: OrderItem[] = cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            imageUrl: item.imageUrl
        }));

        const newOrder: Order = {
            id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            items: orderItems,
            total: getCartTotal(),
            status: 'Pending',
            createdAt: new Date().toISOString(),
            paymentMethod
        };

        setOrders([...orders, newOrder]);
        clearCart();

        return newOrder.id;
    };

    const getOrderById = (id: string): Order | undefined => {
        return orders.find(order => order.id === id);
    };

    const updateOrderStatus = (orderId: string, status: OrderStatus, productId?: number): void => {
        setOrders(
            orders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        items: order.items.map(item =>
                            productId && item.productId === productId ? { ...item, status: "Cancelled" } : item
                        ),
                    };
                }
                return order;
            })
        );
    };


    return (
        <OrderContext.Provider
            value={{
                orders,
                addOrder,
                getOrderById,
                updateOrderStatus
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

export default OrderContext;