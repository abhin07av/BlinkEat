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
        const restaurantRef = doc(db, "restaurants", restaurantId);
        const docSnap = await getDoc(restaurantRef);

        if (docSnap.exists()) {
          setRestaurantName(docSnap.data().name);
        } else {
          setRestaurantName("Restaurant Not Found");
        }
      } else {
        navigate("/");
      }
    };

    fetchRestaurants();
  }, [firebase.user, firebase.role, firebase.firestore, navigate]);

  return (
    <div className="home-page">
      {!isLoggedIn && <MyNavBar />}
      {isLoggedIn && !isOwner && <SignedNavBar />}
      {isLoggedIn && isOwner && <OwnerNavBar />}

      <div className="container">
        <section className="home-hero">
          <h1 className="home-restaurant-name gradient-text animate-fadeInUp">
            {restaurantName}
          </h1>
          <p className="text-secondary text-lg mb-xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Explore our carefully curated menu
          </p>

          <div className="home-food-grid stagger-children">
            <div className="home-food-card rounded-lg overflow-hidden shadow-lg">
              <img src={Dosa} alt="Crispy dosa with chutneys" />
            </div>
            <div className="home-food-card rounded-lg overflow-hidden shadow-lg">
              <img src={Burger} alt="Delicious burgers" />
            </div>
            <div className="home-food-card rounded-lg overflow-hidden shadow-lg">
              <img src={Curry} alt="Rich butter chicken curry" />
            </div>
          </div>

          <div className="mt-xl animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(`/menu/${sessionStorage.getItem("restaurantId")}`)}
              disabled={!sessionStorage.getItem("restaurantId")}
            >
              🍽️ Explore Full Menu
            </button>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="footer-brand">
                <span>🍽️</span>
                <span className="gradient-text">BlinkEat</span>
              </div>
              <p className="footer-text mt-sm">Scan. Order. Enjoy.</p>
            </div>
            <div className="footer-links">
              <span className="footer-text">Contact: support@blinkeat.com</span>
              <span className="footer-text">© 2025 BlinkEat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
