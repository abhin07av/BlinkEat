import React, { useState, useEffect } from "react";
import { Card, Button, Container, Table, Form } from "react-bootstrap";
import { useFirebase } from "../context/Firebase";
import axios from "axios";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import SignedNavBar from "../components/SignedinNav";
import "./Main.css";

const PlaceOrder = () => {
    const firebase = useFirebase();
    const [orders, setOrders] = useState(() => JSON.parse(sessionStorage.getItem("orders")) || []);
    const [upiId, setUpiId] = useState(null);
    const [restaurantName, setRestaurantName] = useState("Restaurant");
    const [screenshot, setScreenshot] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [customerName, setCustomerName] = useState("");

    useEffect(() => {
        const fetchRestaurantUPI = async () => {
            const restaurantId = sessionStorage.getItem("restaurantId");
            if (!restaurantId) return;

            try {
                const restaurantRef = doc(firebase.db, "restaurants", restaurantId);
                const restaurantSnap = await getDoc(restaurantRef);
                if (restaurantSnap.exists()) {
                    const data = restaurantSnap.data();
                    setUpiId(data.upiId || null);
                    setRestaurantName(data.name || "Restaurant");
                }
            } catch (error) {
                console.error("Error fetching restaurant data:", error);
            }
        };

        fetchRestaurantUPI();
    }, [firebase.db]);

    const getTotalPrice = () => orders.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const getUPIURL = () => {
        if (!upiId) return null;
        return `upi://pay?pa=${upiId}&pn=${restaurantName}&am=${getTotalPrice()}&cu=INR`;
    };

    const handleUPIPayment = () => {
        const upiURL = getUPIURL();
        if (upiURL) {
            window.open(upiURL, "_blank");
        } else {
            alert("UPI Payment option not available.");
        }
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Storeimage");
        formData.append("cloud_name", "du8l5qukg");

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/du8l5qukg/image/upload`,
                formData
            );
            return response.data.secure_url;
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            return null;
        }
    };

    const confirmPayment = async () => {
        const userId = sessionStorage.getItem("userId");
        const restaurantId = sessionStorage.getItem("restaurantId");

        if (!userId || !restaurantId) {
            alert("❌ User or Restaurant ID not found. Please log in again.");
            return;
        }

        if (!screenshot) {
            alert("❌ Please upload a payment screenshot before confirming payment.");
            return;
        }

        if (!customerName.trim()) {
            alert("❌ Please enter your name before confirming payment.");
            return;
        }

        setUploading(true);

        let screenshotURL = "";
        try {
            screenshotURL = await uploadToCloudinary(screenshot);
            if (!screenshotURL) {
                alert("❌ Failed to upload screenshot. Please try again.");
                setUploading(false);
                return;
            }
        } catch (error) {
            console.error("Error uploading screenshot:", error);
            alert("❌ Failed to upload screenshot. Please try again.");
            setUploading(false);
            return;
        }

        try {
            const orderData = {
                userId,
                restaurantId,
                customerName,
                items: orders,
                totalAmount: getTotalPrice(),
                paymentStatus: "Paid",
                paymentScreenshot: screenshotURL,
                timestamp: serverTimestamp(),
            };

            await addDoc(collection(firebase.db, `restaurants/${restaurantId}/orders`), orderData);
            alert("✅ Your order has been placed successfully!");

            sessionStorage.removeItem("orders");
            setOrders([]);
            setCustomerName("");
        } catch (error) {
            console.error("Error storing order in Firestore:", error);
            alert("❌ Failed to confirm payment. Please try again.");
        }

        setUploading(false);
    };

    return (
        <div className="peach min-vh-100 d-flex flex-column">
            <SignedNavBar />
            <Container className="flex-grow-1 py-5 d-flex justify-content-center">
                <Card className="p-4 w-100 w-md-75 w-lg-50 border-secondary text-white bg-black shadow-lg">
                    <Card.Body>
                        <h2 className="text-center mb-4">🧾 Order Summary</h2>
                        
                        <div className="table-responsive">
                            <Table bordered hover variant="dark" className="text-center">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Dish</th>
                                        <th>Quantity</th>
                                        <th>Price (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        <div className="text-end mt-3">
                            <h4 className="border-top pt-3">Total: ₹{getTotalPrice()}</h4>
                        </div>

                        <Form.Group controlId="customerName" className="mt-3">
                            <Form.Label>Customer Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your name" 
                                value={customerName} 
                                onChange={(e) => setCustomerName(e.target.value)} 
                                required
                            />
                        </Form.Group>

                        {upiId && (
                            <div className="text-center mt-4">
                                <h5>Scan to Pay via UPI</h5>
                                <QRCodeCanvas value={getUPIURL()} size={150} className="mt-2" />
                            </div>
                        )}

                        <Form.Group controlId="formFile" className="mt-4">
                            <Form.Label>Upload Payment Screenshot <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
                        </Form.Group>

                        {uploading && <p className="text-center text-warning">Uploading screenshot...</p>}
                    </Card.Body>

                    <Card.Footer className="text-center d-flex flex-column flex-md-row justify-content-center gap-3">
                        <Button variant="primary" size="lg" onClick={handleUPIPayment}>
                            Pay Now
                        </Button>
                        <Button variant="success" size="lg" onClick={confirmPayment} disabled={uploading}>
                            Mark as Paid ✅
                        </Button>
                    </Card.Footer>
                </Card>
            </Container>
        </div>
    );
};

export default PlaceOrder;
