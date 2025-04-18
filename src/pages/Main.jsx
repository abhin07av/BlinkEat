import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Card, Container, Row, Col } from "react-bootstrap";
import MyNavBar from "../components/Navbar";
import SignedNavBar from "../components/SignedinNav";
import OwnerNavBar from "../components/Ownernav";
import "./Main.css";

const Main = () => {
    const firebase = useFirebase();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRestaurants = async () => {
        setIsLoading(true);
        try {
            const db = getFirestore();
            const restaurantId = sessionStorage.getItem("restaurantId");

            if (restaurantId) {
                // If restaurant is selected but user navigated back, clear it
                sessionStorage.removeItem("restaurantId");
            }
            
            const restaurantRef = collection(db, "restaurants");
            const querySnapshot = await getDocs(restaurantRef);
            const restaurantList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setRestaurants(restaurantList);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoggedIn(!!firebase.user);
        setIsOwner(firebase.user && firebase.role === "owner");
        
        // Fetch restaurants whenever the component mounts or location changes
        fetchRestaurants();
        
    }, [firebase.user, firebase.role, location.pathname]);

    // Handle Restaurant Selection
    const handleSelectRestaurant = (id, name) => {
        sessionStorage.setItem("restaurantId", id);
        navigate(`/menu/${id}`);
    };

    return (
        <div className="peach min-h-screen d-flex flex-column">
            {!isLoggedIn && <MyNavBar />}
            {isLoggedIn && !isOwner && <SignedNavBar />}
            {isLoggedIn && isOwner && <OwnerNavBar />}
            <div className="background-section">
            
            <Container className="flex-grow-1 py-5">
                <h1 className="Choose large text-center mb-5 ">Choose a Restaurant</h1>

                {isLoading ? (
                    <div className="text-center py-5">
                        <p className="orangetext">Loading restaurants...</p>
                    </div>
                ) : (
                    <Row>
                        {restaurants.map((restaurant) => (
                            <Col key={restaurant.id} md={4} className="mb-4">
                                <Card
                                    bg="black"
                                    className="h-100 border"
                                    onClick={() => handleSelectRestaurant(restaurant.id, restaurant.name)}
                                >
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="orangetext underline">{restaurant.name}</Card.Title>
                                        <Card.Text className="orangetext flex-grow-1">
                                            {restaurant.description ||
                                                "A delightful dining experience offering exceptional cuisine and ambiance."}
                                        </Card.Text>
                                        <button
                                            className="mt-auto text-white px-4 py-2 rounded-md hover:bg-gray-200 transition button"
                                        >
                                            Select Restaurant
                                        </button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
            </div>
            <footer className="background py-4">
                <Container>
                    <div className="text-center text-white">
                        <p className="mb-1">Contact us: blinkeat003@gmail.com</p>
                        <p className="small">© 2025 BlinkEat. All rights reserved.</p>
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default Main;