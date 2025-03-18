import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, Table, Container, Button } from "react-bootstrap";
import OwnerNavBar from "../components/Ownernav";

const Orders = () => {
    const firebase = useFirebase();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!firebase.user) return;

            try {
                const restaurantId = firebase.user.uid;
                const ordersRef = collection(firebase.db, "restaurants", restaurantId, "orders");
                const querySnapshot = await getDocs(ordersRef);

                const orderList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setOrders(orderList);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [firebase.user, firebase.db]);

    // ✅ Move order to history and delete it from active orders
    const handleRemoveOrder = async (order) => {
        const restaurantId = firebase.user.uid;
        const orderRef = doc(firebase.db, "restaurants", restaurantId, "orders", order.id);
        const historyRef = collection(firebase.db, "restaurants", restaurantId, "orderHistory");

        try {
            // ✅ Add order to history
            await addDoc(historyRef, { ...order, timestamp: serverTimestamp() });

            // ✅ Remove order from active orders
            await deleteDoc(orderRef);

            // ✅ Update UI
            setOrders(orders.filter(o => o.id !== order.id));
        } catch (error) {
            console.error("Error removing order:", error);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            <OwnerNavBar />
            <Container className="py-5">
                <h1 className="text-center mb-4 fw-bold">📦 Active Orders</h1>
                {loading ? (
                    <p className="text-center fs-5">Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p className="text-center fs-5">No active orders.</p>
                ) : (
                    <Card className="p-4 border-secondary shadow-lg">
                        <div className="table-responsive"> {/* ✅ Table now scrolls on small screens */}
                            <Table bordered hover variant="dark" className="text-center">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Customer</th>
                                        <th>Order Details</th>
                                        <th>Total Price (₹)</th>
                                        <th>Payment Screenshot</th>
                                        <th>Time</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={order.id}>
                                            <td>{index + 1}</td>
                                            <td className="text-wrap">{order.customerName || "Unknown"}</td>  
                                            <td className="text-wrap">{order.items.map(item => `${item.name} x ${item.quantity}`).join(", ")}</td>
                                            <td>{order.totalAmount}</td>
                                            <td>
                                                {order.paymentScreenshot ? (
                                                    <img 
                                                        src={order.paymentScreenshot} 
                                                        alt="Payment Screenshot" 
                                                        className="img-fluid rounded shadow" 
                                                        style={{ maxWidth: "100px", height: "auto" }} 
                                                    />
                                                ) : (
                                                    "No Screenshot"
                                                )}
                                            </td>
                                            <td className="text-wrap">{new Date(order.timestamp?.seconds * 1000).toLocaleString()}</td>
                                            <td>
                                                <Button variant="success" size="sm" onClick={() => handleRemoveOrder(order)}>
                                                    Order Delivered
                                                </Button>
                                            </td>
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

export default Orders;
