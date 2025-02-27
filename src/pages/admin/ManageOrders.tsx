import React, { useEffect, useState } from "react";
import { Table, Button, Container, Badge, Form } from "react-bootstrap";
import { firestore, database } from "../../config/firebase";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, get } from "firebase/database";

interface Order {
    id: string;
    userId: string;
    userEmail: string;
    paymentMethod: string;
    date: string;
    savedAt: string; // Add savedAt to the interface
    products: {
        productName: string;
        quantity: number;
        productPrice: number;
        status: string;
        approval: boolean;
        savedAt: string; // Make sure it's in the products as well
    }[];
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
            const timeA = a.products[0]?.savedAt || "0";
            const timeB = b.products[0]?.savedAt || "0";

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

    const toggleSortDirection = () => {
        setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    };

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
            let allOrders: Order[] = [];
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
                            savedAt: products[0]?.savedAt || "0", // Add savedAt for sorting
                            products: products.map((product: any) => ({
                                productName: product.productName || "Unknown",
                                quantity: product.quantity || 0,
                                productPrice: product.productPrice || 0,
                                status: product.status || "pending",
                                approval: product.approval || false,
                                savedAt: product.savedAt || "0" // Ensure savedAt is included
                            })),
                        });
                    });

                    setOrders((prevOrders) => [...prevOrders.filter(order => order.userId !== userId), ...newOrders]);
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
    }, []);

    const updateOrderApproval = async (userId: string, orderId: string, newApproval: boolean) => {
        try {
            const orderRef = doc(firestore, `users/${userId}/orders/${orderId}`);

            // Get the current order data before updating
            const orderSnapshot = await getDoc(orderRef);
            if (!orderSnapshot.exists()) {
                console.error("❌ Order not found!");
                return;
            }

            const orderData = orderSnapshot.data();
            const updatedProducts = orderData.products.map((product: any) => ({
                ...product, // Keep all existing fields
                approval: newApproval, // Change only the approval field
            }));

            // Update Firestore document
            await updateDoc(orderRef, {
                products: updatedProducts, // Preserve all fields, update only approval
            });

            console.log(`✅ Order ${orderId} approval set to ${newApproval}`);
        } catch (error) {
            console.error("❌ Error updating order approval:", error);
        }
    };

    const updateOrderStatus = async (userId: string, orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(firestore, `users/${userId}/orders/${orderId}`);

            // Get current order data
            const orderSnapshot = await getDoc(orderRef);
            if (!orderSnapshot.exists()) {
                console.error("❌ Order not found!");
                return;
            }

            const orderData = orderSnapshot.data();
            const updatedProducts = orderData.products.map((product: any) => ({
                ...product, // Preserve all existing fields
                status: newStatus, // Change only status
                updatedAt: new Date().toISOString(), // Update timestamp
            }));

            // Update Firestore document
            await updateDoc(orderRef, {
                products: updatedProducts, // Preserve fields, update only status
            });

            console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
        } catch (error) {
            console.error("❌ Error updating order status:", error);
        }
    };

    return (
        <Container className="mt-4">
            <h1 className="text-primary">Manage Orders</h1>
            <p className="text-muted">View, approve, and cancel orders in real-time.</p>

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
                            <th>User Email</th>
                            <th>Payment Method</th>
                            <th>Products</th>
                            <th>Status</th>
                            <th>Change Status</th>
                            <th>Change Approval</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{userEmails[order.userId] || "Fetching..."}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>
                                        {order.products.map((product, index) => (
                                            <div key={index}>
                                                {product.productName} - {product.quantity} pcs - ₱{product.productPrice}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        <Badge
                                            bg={order.products[0].status === "pending" ? "warning" :
                                                order.products[0].status === "completed" ? "success" : "danger"}
                                            className="fw-bold"
                                        >
                                            {order.products[0].status.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Form.Select
                                            value={order.products[0].status}
                                            onChange={(e) => updateOrderStatus(order.userId, order.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </Form.Select>
                                    </td>
                                    <td>
                                        {!order.products[0].approval ? (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => updateOrderApproval(order.userId, order.id, true)}
                                            >
                                                Approve
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => updateOrderApproval(order.userId, order.id, false)}
                                            >
                                                Disapprove
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center text-muted">No orders found.</td>
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