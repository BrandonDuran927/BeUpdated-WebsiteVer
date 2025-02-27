import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { firestore, database } from "../../config/firebase"; // ✅ Import Firestore & Realtime Database
import { collection, onSnapshot } from "firebase/firestore";
import { ref, get } from "firebase/database";
import { Spinner, Table, Card, Row, Col, Container, Button } from "react-bootstrap";
import AuthContext from "../../context/AuthContext"; // ✅ Import AuthContext

interface OrderSummary {
    pending: number;
    completed: number;
    cancelled: number;
}

const AdminDashboard: React.FC = () => {
    const authContext = useContext(AuthContext);
    const user = authContext?.user || null; // ✅ Ensure AuthContext exists

    const [orderSummary, setOrderSummary] = useState<OrderSummary>({ pending: 0, completed: 0, cancelled: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [userEmails, setUserEmails] = useState<{ [key: string]: string }>({}); // ✅ Store user emails
    const [loading, setLoading] = useState(true);

    // ✅ Function to Fetch All User Emails from Firebase Realtime Database
    const fetchAllUserEmails = async () => {
        try {
            console.log("📡 Fetching all user emails...");

            const usersRef = ref(database, "users");
            const snapshot = await get(usersRef);

            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const emailMap: { [key: string]: string } = {};

                Object.keys(usersData).forEach((uid) => {
                    emailMap[uid] = usersData[uid].email || "Unknown";
                });

                console.log("✅ Emails fetched:", emailMap);
                return emailMap;
            } else {
                console.warn("⚠️ No users found in the database.");
                return {};
            }
        } catch (error) {
            console.error("❌ Error fetching emails:", error);
            return {};
        }
    };

    useEffect(() => {
        console.log("🔍 Setting up real-time listener for all orders...");

        const usersRef = collection(firestore, "users");

        const unsubscribeUsers = onSnapshot(usersRef, async (usersSnapshot) => {
            console.log("📊 Users updated:", usersSnapshot.docs.length);

            let pendingCount = 0;
            let completedCount = 0;
            let cancelledCount = 0;
            let orderMap = new Map();
            let unsubOrdersList: (() => void)[] = [];

            const emails = await fetchAllUserEmails();
            setUserEmails(emails);

            usersSnapshot.docs.forEach((userDoc) => {
                const userId = userDoc.id;
                const ordersRef = collection(firestore, `users/${userId}/orders`);

                const unsubscribeOrders = onSnapshot(ordersRef, (ordersSnapshot) => {
                    console.log(`📦 Orders updated for user ${userId}:`, ordersSnapshot.docs.length);

                    let updatedOrders = new Map(orderMap);

                    ordersSnapshot.docs.forEach((orderDoc) => {
                        const orderData = orderDoc.data();
                        const orderId = orderDoc.id;

                        let latestStatus = "pending";
                        let orderTimestamp = orderData.timestamp ? new Date(orderData.timestamp).getTime() : 0;

                        if (orderData.products && Array.isArray(orderData.products)) {
                            const latestProduct = orderData.products.reduce((latest, product) => {
                                return new Date(product.savedAt).getTime() > new Date(latest.savedAt).getTime()
                                    ? product
                                    : latest;
                            });

                            latestStatus = latestProduct.status;
                            orderTimestamp = new Date(latestProduct.savedAt).getTime();

                            if (latestStatus === "pending") pendingCount++;
                            else if (latestStatus === "completed") completedCount++;
                            else if (latestStatus === "cancelled") cancelledCount++;
                        }

                        updatedOrders.set(orderId, {
                            id: orderId,
                            user: userId,
                            date: orderData.timestamp ? new Date(orderData.timestamp).toLocaleDateString() : "Unknown",
                            status: latestStatus,
                            timestamp: orderTimestamp
                        });
                    });

                    let uniqueOrders = Array.from(updatedOrders.values());

                    uniqueOrders.sort((a, b) => b.timestamp - a.timestamp);

                    if (uniqueOrders.length > 0) {
                        setRecentOrders(uniqueOrders.slice(0, 5));
                    } else {
                        setRecentOrders([
                            {
                                id: "placeholder-1",
                                user: "No recent orders",
                                date: "-",
                                status: "-",
                                timestamp: 0
                            }
                        ]);
                    }

                    setOrderSummary({
                        pending: pendingCount,
                        completed: completedCount,
                        cancelled: cancelledCount
                    });

                    orderMap = updatedOrders;
                });

                unsubOrdersList.push(unsubscribeOrders);
            });

            setLoading(false);

            return () => {
                console.log("🛑 Unsubscribing from Firestore listeners...");
                unsubscribeUsers();
                unsubOrdersList.forEach((unsub) => unsub());
            };
        });

        return () => {
            console.log("🛑 Unsubscribing from Firestore listeners...");
            unsubscribeUsers();
        };
    }, []);



    return (
        <Container className="mt-4">
            <h1 className="mb-3 text-primary">Admin Dashboard</h1>
            <p className="text-muted">
                Welcome, <strong>admin</strong>
            </p> {/* ✅ Show logged-in admin's email */}

            {loading ? (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading...</p>
                </div>
            ) : (
                <>
                    {/* Order Summary Cards */}
                    <Row className="mb-4">
                        <Col md={4}>
                            <Card className="text-white bg-warning shadow">
                                <Card.Body>
                                    <Card.Title>Pending Orders</Card.Title>
                                    <Card.Text className="display-5">{orderSummary.pending}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-white bg-success shadow">
                                <Card.Body>
                                    <Card.Title>Completed Orders</Card.Title>
                                    <Card.Text className="display-5">{orderSummary.completed}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-white bg-danger shadow">
                                <Card.Body>
                                    <Card.Title>Cancelled Orders</Card.Title>
                                    <Card.Text className="display-5">{orderSummary.cancelled}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Recent Orders Table */}
                    <Card className="mb-4 shadow">
                        <Card.Body>
                            <Card.Title>Recent Orders</Card.Title>
                            <Table striped bordered hover responsive className="mt-3">
                                <thead>
                                    <tr className="table-primary">
                                        <th>Order ID</th>
                                        <th>User Email</th> {/* ✅ Changed from UID to Email */}
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{userEmails[order.user] || "Fetching..."}</td> {/* ✅ Display Email */}
                                                <td>{order.date}</td>
                                                <td className={`fw-bold ${order.status === "pending" ? "text-warning" : order.status === "completed" ? "text-success" : "text-danger"}`}>
                                                    {order.status}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center text-muted">
                                                No recent orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </>
            )}
        </Container>
    );
};

export default AdminDashboard;
