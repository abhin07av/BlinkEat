import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import MyNavBar from "../components/Navbar";
import SignedNavBar from "../components/SignedinNav";
import OwnerNavBar from "../components/Ownernav";

const restaurantEmojis = ["🍕", "🍔", "🍜", "🍛", "🥘", "🍣", "🌮", "🥗", "🍝", "🍱"];

const Main = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isOwner, setIsOwner] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      const restaurantId = sessionStorage.getItem("restaurantId");
      if (restaurantId) {
        sessionStorage.removeItem("restaurantId");
      }

      const restaurantRef = collection(db, "restaurants");
      const querySnapshot = await getDocs(restaurantRef);
      const restaurantList = querySnapshot.docs.map((doc) => ({
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
    fetchRestaurants();
    // eslint-disable-next-line
  }, [firebase.user, firebase.role, location.pathname]);

  const handleSelectRestaurant = (id) => {
    sessionStorage.setItem("restaurantId", id);
    navigate(`/menu/${id}`);
  };

  const filteredRestaurants = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-dark">
      {!isLoggedIn && <MyNavBar />}
      {isLoggedIn && !isOwner && <SignedNavBar />}
      {isLoggedIn && isOwner && <OwnerNavBar />}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-badge">✨ India's favourite food ordering platform</div>
          <h1 className="hero-title">
            <span className="gradient-text">Order Food</span>
            <br />
            in a Blink 🍽️
          </h1>
          <p className="hero-subtitle">
            Scan, browse menus, and place orders instantly. No app downloads — just delicious food, delivered to your table.
          </p>
          <div className="hero-actions">
            {!isLoggedIn && (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
                  Get Started — It's Free
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => navigate("/login")}>
                  Sign In →
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Restaurant Listing */}
      <section className="restaurants-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Choose a Restaurant</h2>
              <p className="section-subtitle">
                {restaurants.length} restaurants available near you
              </p>
            </div>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="restaurant-grid stagger-children">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: 140, borderRadius: 0 }} />
                  <div className="card-body">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-text" />
                    <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="restaurant-grid stagger-children">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="restaurant-card card-interactive"
                    onClick={() => handleSelectRestaurant(restaurant.id)}
                  >
                    <div className="restaurant-card-banner">
                      <div
                        className="restaurant-card-gradient"
                        style={{
                          background: `linear-gradient(135deg, 
                            hsl(${(index * 40 + 20) % 360}, 70%, 55%), 
                            hsl(${(index * 40 + 60) % 360}, 60%, 45%))`,
                        }}
                      />
                      <span className="restaurant-card-emoji">
                        {restaurantEmojis[index % restaurantEmojis.length]}
                      </span>
                    </div>
                    <div className="restaurant-card-body">
                      <h3 className="restaurant-card-name">{restaurant.name}</h3>
                      <p className="restaurant-card-desc">
                        {restaurant.description ||
                          "A delightful dining experience offering exceptional cuisine and warm ambiance."}
                      </p>
                      <div className="restaurant-card-footer">
                        <div className="restaurant-card-meta">
                          <span className="restaurant-card-tag">⭐ 4.{3 + (index % 6)}</span>
                          <span className="restaurant-card-tag">🕐 20-30 min</span>
                        </div>
                        <span className="restaurant-card-arrow">→</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3xl" style={{ gridColumn: "1 / -1" }}>
                  <p className="text-2xl mb-md" style={{ opacity: 0.4 }}>🔍</p>
                  <p className="text-xl font-semibold text-secondary">
                    No restaurants found matching "{searchQuery}"
                  </p>
                  <p className="text-sm text-tertiary mt-sm">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="footer-brand">
                <span>🍽️</span>
                <span className="gradient-text">BlinkEat</span>
              </div>
              <p className="footer-text mt-sm">
                Scan. Order. Enjoy. — The future of dining.
              </p>
            </div>
            <div className="footer-links">
              <span className="footer-text">Contact: blinkeat003@gmail.com</span>
              <span className="footer-text">© 2025 BlinkEat. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;