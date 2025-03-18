import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import MyNavBar from "../components/Navbar";
import SignedNavBar from "../components/SignedinNav";
import OwnerNavBar from "../components/Ownernav";
import Dosa from "../assets/Dosa.png";
import Burger from "../assets/Burger.png";
import Curry from "../assets/Curry.png";
import "./Home.css";
import "./Main.css";
const Home = () => {
    const firebase = useFirebase();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [restaurantName, setRestaurantName] = useState("Loading...");

    useEffect(() => {
        setIsLoggedIn(!!firebase.user);
        setIsOwner(firebase.user && firebase.role === "owner");

        const fetchRestaurants = async () => {
            const db = getFirestore();
            const restaurantId = sessionStorage.getItem("restaurantId");

            if (restaurantId) {
                // Fetch selected restaurant details
                const restaurantRef = doc(db, "restaurants", restaurantId);
                const docSnap = await getDoc(restaurantRef);

                if (docSnap.exists()) {
                    setRestaurantName(docSnap.data().name);
                } else {
                    setRestaurantName("Restaurant Not Found");
                }
            }
            else{
                navigate("/");
            }
        };

        fetchRestaurants();
    }, [firebase.user, firebase.role, firebase.firestore,navigate]);

    return (
        <div className="Home">
            {!isLoggedIn && <MyNavBar />}
            {isLoggedIn && !isOwner && <SignedNavBar />}
            {isLoggedIn && isOwner && <OwnerNavBar />}
            
            <div className="contents">
                <h1 className="res-name">{restaurantName}</h1> {/* Show selected restaurant */}
                <div className="her min-h-screen flex flex-col">
                    <div className="bg-rose-500 flex-grow py-16">
                        <div className="max-w-6xl mx-auto px-4">
                            <div className="Foods grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-mint-100 p-2 rounded-lg shadow-lg">
                                    <img src={Dosa} alt="Dosa with chutneys" className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-md"/>
                                </div>
                                <div className="bg-mint-100 p-2 rounded-lg shadow-lg">
                                    <img src={Burger} alt="Assorted burgers" className="w-full h-64 object-cover rounded-md"/>
                                </div>
                                <div className="bg-mint-100 p-2 rounded-lg shadow-lg">
                                    <img src={Curry} alt="Butter chicken curry" className="w-full h-64 object-cover rounded-md"/>
                                </div>
                            </div>

                            {/* Explore Menu Button */}
                            <div className="Explore">
                                <button 
                                    className="Expbuttn px-6 py-3 rounded-md hover:bg-purple-700 transition-colors shadow-lg"
                                    onClick={() => navigate(`/menu/${sessionStorage.getItem("restaurantId")}`)}
                                    disabled={!sessionStorage.getItem("restaurantId")}
                                >
                                    Explore Menu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-white sm:py-8">
                <div className="w-full max-w-6xl mx-auto px-4">
                    <div className="contact text-center text-gray-500">
                        <p className="text-sm sm:text-base">Contact us: support@blinkeat.com</p>
                        <p className="text-xs sm:text-sm">© 2023 BlinkEat. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
