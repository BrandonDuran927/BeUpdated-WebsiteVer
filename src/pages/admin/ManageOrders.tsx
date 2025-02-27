import React, { useEffect, useState } from "react";
import { Table, Button, Container, Badge, Form } from "react-bootstrap";
import { firestore, database } from "../../config/firebase";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, get } from "firebase/database";

interface Product {
    productId?: string;
    productName: string;
    quantity: number;
    productPrice: number;
    status: string;
    approval: boolean;
    savedAt: string;
    updatedAt?: string;
    productColor?: string;
    productSize?: string;
}

interface Order {
    id: string;
    userId: string;
    userEmail: string;
    paymentMethod: string;
    date: string;
    savedAt: string;
    products: Product[];
}

const ORDERS_PER_PAGE = 10;

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [userEmails, setUserEmails] = useState<{ [key: string]: string }>({});
    const [filter, setFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default to newest first

    const sortOrders = (ordersToSort: Order[]) => {
        return [...ordersToSort].sort((a, b) => {
            const timeA = a.savedAt || "0";
            const timeB = b.savedAt || "0";

            return sortDirection === "desc"
                ? timeB.localeCompare(timeA)
                : timeA.localeCompare(timeB);
        });
    };

    const filteredOrders = sortOrders(
        orders.filter((order) =>
            filter === "all" || order.products.some((product) => product.status === filter)
        )
    );

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        const fetchUserEmails = async () => {
            try {
                console.log("📡 Fetching user emails...");
                const usersRef = ref(database, "users");
                const snapshot = await get(usersRef);

                if (snapshot.exists()) {
                    const usersData = snapshot.val();
                    const emailMap: { [key: string]: string } = {};

                    Object.keys(usersData).forEach((uid) => {
                        emailMap[uid] = usersData[uid].email || "Unknown";
                    });

                    console.log("✅ User emails fetched:", emailMap);
                    setUserEmails(emailMap);
                } else {
                    console.warn("⚠️ No users found in the database.");
                }
            } catch (error) {
                console.error("❌ Error fetching user emails:", error);
            }
        };

        fetchUserEmails();
    }, []);

    // Fetch orders when the component mounts
    useEffect(() => {
        console.log("📡 Setting up real-time listener for orders...");
        const unsubscribeUsers = onSnapshot(collection(firestore, "users"), (usersSnapshot) => {
            let unsubscribeOrdersList: (() => void)[] = [];

            usersSnapshot.docs.forEach((userDoc) => {
                const userId = userDoc.id;
                const ordersRef = collection(firestore, `users/${userId}/orders`);

                const unsubscribeOrders = onSnapshot(ordersRef, (ordersSnapshot) => {
                    let newOrders: Order[] = [];

                    ordersSnapshot.docs.forEach((orderDoc) => {
                        const orderData = orderDoc.data();
                        const products = Array.isArray(orderData.products)
                            ? orderData.products
                            : Object.values(orderData.products || {});

                        if (!products || products.length === 0) {
                            console.warn(`⚠️ Order ${orderDoc.id} has missing or invalid data.`);
                            return;
                        }

                        newOrders.push({
                            id: orderDoc.id,
                            userId: userId,
                            userEmail: userEmails[userId] || "Fetching...",
                            paymentMethod: orderData.paymentMethod || "Unknown",
                            date: orderData.timestamp ? new Date(orderData.timestamp).toLocaleDateString() : "Unknown",
                            savedAt: orderData.timestamp?.toString() || "0",
                            products: products.map((product: any, index: number) => ({
                                productId: product.productId || `product-${index}`,
                                productName: product.productName || "Unknown",
                                quantity: product.quantity || 0,
                                productPrice: product.productPrice || 0,
                                status: product.status || "pending",
                                approval: product.approval || false,
                                savedAt: product.savedAt || "0",
                                updatedAt: product.updatedAt || "",
                                productColor: product.productColor || "",
                                productSize: product.productSize || ""
                            })),
                        });
                    });

                    setOrders((prevOrders) => {
                        const filteredPrevOrders = prevOrders.filter(order =>
                            !newOrders.some(newOrder =>
                                newOrder.userId === order.userId && newOrder.id === order.id
                            )
                        );
                        return [...filteredPrevOrders, ...newOrders];
                    });
                });

                unsubscribeOrdersList.push(unsubscribeOrders);
            });

            return () => {
                console.log("🛑 Unsubscribing from Firestore listeners...");
                unsubscribeOrdersList.forEach((unsub) => unsub());
            };
        });

        return () => {
            console.log("🛑 Unsubscribing from Firestore user listener...");
            unsubscribeUsers();
        };
    }, [userEmails]);

    const updateProductApproval = async (userId: string, orderId: string, productIndex: number, newApproval: boolean) => {
        try {
            const orderRef = doc(firestore, `users/${userId}/orders/${orderId}`);

            // Get the current order data
            const orderSnapshot = await getDoc(orderRef);
            if (!orderSnapshot.exists()) {
                console.error("❌ Order not found!");
                return;
            }

            const orderData = orderSnapshot.data();
            const products = [...orderData.products]; // Create a copy to modify

            // Update only the specific product's approval
            if (products[productIndex]) {
                products[productIndex] = {
                    ...products[productIndex],
                    approval: newApproval,
                    updatedAt: new Date().toISOString()
                };

                // Update Firestore document
                await updateDoc(orderRef, { products });
                console.log(`✅ Product #${productIndex} in Order ${orderId} approval set to ${newApproval}`);
            } else {
                console.error(`❌ Product at index ${productIndex} not found in order ${orderId}`);
            }
        } catch (error) {
            console.error("❌ Error updating product approval:", error);
        }
    };

    const updateProductStatus = async (userId: string, orderId: string, productIndex: number, newStatus: string) => {
        try {
            const orderRef = doc(firestore, `users/${userId}/orders/${orderId}`);

            // Get the current order data
            const orderSnapshot = await getDoc(orderRef);
            if (!orderSnapshot.exists()) {
                console.error("❌ Order not found!");
                return;
            }

            const orderData = orderSnapshot.data();
            const products = [...orderData.products]; // Create a copy to modify

            // Update only the specific product's status
            if (products[productIndex]) {
                products[productIndex] = {
                    ...products[productIndex],
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                };

                // Update Firestore document
                await updateDoc(orderRef, { products });
                console.log(`✅ Product #${productIndex} in Order ${orderId} status updated to ${newStatus}`);
            } else {
                console.error(`❌ Product at index ${productIndex} not found in order ${orderId}`);
            }
        } catch (error) {
            console.error("❌ Error updating product status:", error);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "pending": return "warning";
            case "completed": return "success";
            case "cancelled": return "danger";
            default: return "secondary";
        }
    };

    return (
        <Container className="mt-4">
            <h1 className="text-primary">Manage Orders</h1>
            <p className="text-muted">View, approve, and cancel individual products in orders in real-time.</p>

            {/* Filter and Sort Controls */}
            <div className="d-flex justify-content-between mb-3">
                <Form.Group className="me-3" style={{ flex: 1 }}>
                    <Form.Label>Filter by Status</Form.Label>
                    <Form.Select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setCurrentPage(1); // Reset to first page when filter changes
                        }}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group style={{ flex: 1 }}>
                    <Form.Label>Sort by Date</Form.Label>
                    <div className="d-flex">
                        <Button
                            variant={sortDirection === "desc" ? "primary" : "outline-primary"}
                            className="me-2 w-100"
                            onClick={() => setSortDirection("desc")}
                        >
                            Newest First
                        </Button>
                        <Button
                            variant={sortDirection === "asc" ? "primary" : "outline-primary"}
                            className="w-100"
                            onClick={() => setSortDirection("asc")}
                        >
                            Oldest First
                        </Button>
                    </div>
                </Form.Group>
            </div>

            {/* Scrollable Orders Table */}
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <Table striped bordered hover responsive>
                    <thead className="table-primary">
                        <tr>
                            <th>Order ID</th>
                            <th>User</th>
                            <th>Payment</th>
                            <th>Product</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.length > 0 ? (
                            paginatedOrders.flatMap((order) => (
                                // Flatten the array to show each product as a separate row
                                order.products.map((product, productIndex) => (
                                    <tr key={`${order.id}-${productIndex}`}>
                                        {/* Only show order ID, user email, and payment method for the first product */}
                                        {productIndex === 0 ? (
                                            <>
                                                <td rowSpan={order.products.length}>{order.id}</td>
                                                <td rowSpan={order.products.length}>
                                                    {userEmails[order.userId] || "Fetching..."}
                                                    <div className="text-muted small">Order Date: {order.date}</div>
                                                </td>
                                                <td rowSpan={order.products.length}>{order.paymentMethod}</td>
                                            </>
                                        ) : (
                                            // These cells are hidden for non-first products due to rowSpan above
                                            <></>
                                        )}

                                        {/* Product details - shown for each product */}
                                        <td>
                                            {product.productName}
                                            {product.productColor && <div className="small">Color: {product.productColor}</div>}
                                            {product.productSize && <div className="small">Size: {product.productSize}</div>}
                                        </td>

                                        <td>
                                            Quantity: {product.quantity} pcs
                                            <div>Price: ₱{product.productPrice}</div>
                                            <div className="small text-muted">Item Total: ₱{product.quantity * product.productPrice}</div>
                                        </td>

                                        <td>
                                            <Badge
                                                bg={getStatusBadgeColor(product.status)}
                                                className="fw-bold mb-2 d-block"
                                            >
                                                {product.status.toUpperCase()}
                                            </Badge>
                                            {product.updatedAt && (
                                                <small className="text-muted d-block">
                                                    Updated: {new Date(product.updatedAt).toLocaleString()}
                                                </small>
                                            )}
                                        </td>

                                        <td>
                                            <div className="mb-2">
                                                <Form.Select
                                                    size="sm"
                                                    value={product.status}
                                                    onChange={(e) => updateProductStatus(order.userId, order.id, productIndex, e.target.value)}
                                                    className="mb-2"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </Form.Select>
                                            </div>

                                            {!product.approval ? (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="w-100"
                                                    onClick={() => updateProductApproval(order.userId, order.id, productIndex, true)}
                                                >
                                                    Approve
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="w-100"
                                                    onClick={() => updateProductApproval(order.userId, order.id, productIndex, false)}
                                                >
                                                    Disapprove
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center text-muted">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between mt-3">
                    <Button variant="primary" onClick={prevPage} disabled={currentPage === 1}>
                        Previous
                    </Button>
                    <span className="align-self-center">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button variant="primary" onClick={nextPage} disabled={currentPage >= totalPages}>
                        Next
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default ManageOrders;