import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, Table, Container } from "react-bootstrap";
import OwnerNavBar from "../components/Ownernav";

const OrderHistory = () => {
    const firebase = useFirebase();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!firebase.user) return;

            try {
                const restaurantId = firebase.user.uid;
                const historyRef = collection(firebase.db, "restaurants", restaurantId, "orderHistory");
                const querySnapshot = await getDocs(historyRef);

                const historyList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setHistory(historyList);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching history:", error);
                setLoading(false);
            }
        };

        fetchHistory();
    }, [firebase.user, firebase.db]);

    return (
        <div className="min-vh-100 d-flex flex-column">
            <OwnerNavBar />
            <Container className="py-5">
                <h1 className="text-center mb-4 fw-bold">📜 Order History</h1>
                {loading ? (
                    <p className="text-center fs-5">Loading history...</p>
                ) : history.length === 0 ? (
                    <p className="text-center fs-5">No past orders.</p>
                ) : (
                    <Card className="p-4 border-secondary shadow-lg">
                        <div className="table-responsive"> {/* ✅ Table scrolls on small screens */}
                            <Table bordered hover variant="dark" className="text-center">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Customer Name</th>
                                        <th>Order Details</th>
                                        <th>Total Price (₹)</th>
                                        <th>Customer ID</th>
                                        <th>Payment Screenshot</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((order, index) => (
                                        <tr key={order.id}>
                                            <td>{index + 1}</td>
                                            <td className="text-wrap">{order.customerName || "Unknown"}</td>  
                                            <td className="text-wrap">{order.items.map(item => `${item.name} x ${item.quantity}`).join(", ")}</td>
                                            <td>{order.totalAmount}</td>
                                            <td className="text-wrap">{order.userId}</td>
                                            <td>
                                                {order.paymentScreenshot ? (
                                                    <a 
                                                        href={order.paymentScreenshot} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="d-inline-block text-decoration-none"
                                                    >
                                                        📷 View Screenshot
                                                    </a>
                                                ) : "No Screenshot"}
                                            </td>
                                            <td className="text-wrap">{new Date(order.timestamp?.seconds * 1000).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                )}
            </Container>
        </div>
    );
};

export default OrderHistory;
