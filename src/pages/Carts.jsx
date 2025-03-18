import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import MyNavBar from "../components/Navbar";
import SignedNavBar from "../components/SignedinNav";
import OwnerNavBar from "../components/Ownernav";
import "./Main.css";

const Carts = () => {
    const firebase = useFirebase();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [orders, setOrders] = useState(() => {
        return JSON.parse(sessionStorage.getItem("orders")) || [];
    });

    useEffect(() => {
        setIsLoggedIn(!!firebase.user);
        setIsOwner(firebase.user && firebase.role === "owner");
    }, [firebase.user, firebase.role]);

    // Function to calculate total price
    const getTotalPrice = () => {
        return orders.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    // Get the restaurant ID from sessionStorage
    const restaurantId = sessionStorage.getItem("restaurantId");

    return (
        <div className="peach min-vh-100 d-flex flex-column justify-content-center">
            {/* ✅ Navbar at the top */}
            {!isLoggedIn && <MyNavBar />}
            {isLoggedIn && !isOwner && <SignedNavBar />}
            {isLoggedIn && isOwner && <OwnerNavBar />}

            {/* ✅ Centered Cart Content */}
            <Container className="flex-grow-1 py-5 d-flex flex-column justify-content-center">
                <h1 className="orangetext large text-center mb-5">Your Orders</h1>
                <Row className="justify-content-center">
                    {orders.length > 0 ? (
                        orders.map((item) => (
                            <Col key={item.id} md={4} className="mb-4">
                                <Card className="h-100 border-secondary text-white bg-black">
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Text>
                                            Quantity: {item.quantity}
                                            <br />
                                            Price: Rs.{(item.price * item.quantity).toFixed(2)}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <p className="text-center text-white">Your cart is empty.</p>
                    )}
                </Row>

                {/* ✅ Total Price */}
                {orders.length > 0 && (
                    <div className="text-center mt-4">
                        <h2 className="border h2 p-3 d-inline-block">Total: Rs.{getTotalPrice()}</h2>
                    </div>
                )}
            </Container>

            {/* ✅ Place Order & Modify Order Buttons */}
            <div className="text-center mb-5">
                <Button 
                    variant="success" 
                    size="lg" 
                    onClick={() => { 
                        console.log("Navigating - isLoggedIn:", isLoggedIn); 
                        navigate(isLoggedIn ? "/placeorder" : "/login"); 
                        if (!isLoggedIn) alert("Sign in to Place Order");
                    }}
                >
                    Place Order
                </Button>

                {/* ✅ Modify Order Button - Redirect to the restaurant's menu */}
                <Button variant="danger" size="lg"
                    className="viewcart ms-3" 
                    onClick={() => { 
                        if (restaurantId) {
                            navigate(`/menu/${restaurantId}`);
                        } else {
                            alert("No restaurant selected. Please scan a restaurant QR code.");
                        }
                    }}
                >
                    Modify Order ({orders.length})
                </Button>
            </div>
        </div>
    );
};

export default Carts;
