import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useFirebase } from "../context/Firebase";
import { useParams, useNavigate } from "react-router-dom";
import SignedNavBar from "../components/SignedinNav";
import MyNavBar from "../components/Navbar";
import OwnerNavBar from "../components/Ownernav";
import PageTransition from "../components/PageTransition";

const MenuPage = () => {
  const firebase = useFirebase();
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState({});
  const [orders, setOrders] = useState(() => {
    return JSON.parse(sessionStorage.getItem("orders")) || [];
  });
  const [isOwner, setIsOwner] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuRef = collection(firebase.db, `restaurants/${restaurantId}/menu`);
        const querySnapshot = await getDocs(menuRef);

        if (!querySnapshot.empty) {
          const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const groupedItems = items.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setMenuItems(groupedItems);
          setActiveCategory(Object.keys(groupedItems)[0] || "");
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    if (restaurantId) fetchMenu();
  }, [firebase.db, restaurantId]);

  useEffect(() => {
    setIsOwner(firebase.user && firebase.role === "owner");
  }, [firebase.user, firebase.role]);

  const scrollToCategory = (category) => {
    setActiveCategory(category);
    categoryRefs.current[category]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const addToCart = (item) => {
    const updatedOrders = [...orders, { ...item, quantity: 1 }];
    setOrders(updatedOrders);
    sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const increaseQuantity = (item) => {
    const updatedOrders = orders.map((order) =>
      order.id === item.id ? { ...order, quantity: order.quantity + 1 } : order
    );
    setOrders(updatedOrders);
    sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const decreaseQuantity = (item) => {
    const updatedOrders = orders
      .map((order) =>
        order.id === item.id ? { ...order, quantity: order.quantity - 1 } : order
      )
      .filter((order) => order.quantity > 0);
    setOrders(updatedOrders);
    sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const getQuantity = (item) => {
    const existingOrder = orders.find((order) => order.id === item.id);
    return existingOrder ? existingOrder.quantity : 0;
  };

  const getTotalPrice = () => {
    return orders.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const categories = Object.keys(menuItems);

  // Filter items by search query
  const getFilteredItems = () => {
    if (!searchQuery.trim()) return menuItems;
    const query = searchQuery.toLowerCase();
    const filtered = {};
    Object.entries(menuItems).forEach(([category, items]) => {
      const matching = items.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
      if (matching.length > 0) filtered[category] = matching;
    });
    return filtered;
  };

  const filteredItems = getFilteredItems();
  const filteredCategories = Object.keys(filteredItems);
  const totalFilteredItems = Object.values(filteredItems).flat().length;

  return (
    <PageTransition>
    <div className="menu-page">
      {!firebase.user && <MyNavBar />}
      {firebase.user && (isOwner ? <OwnerNavBar /> : <SignedNavBar />)}

      <div className="container">
        {/* Header */}
        <div className="menu-header">
          <h1 className="menu-title gradient-text">Restaurant Menu</h1>
          <p className="text-secondary">
            {categories.length > 0
              ? `${categories.length} categories • ${Object.values(menuItems).flat().length} items`
              : "Loading menu..."}
          </p>
        </div>

        {/* Search Bar */}
        {categories.length > 0 && (
          <div className="search-bar mx-auto mb-lg" style={{ maxWidth: '500px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search for a dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Search results count */}
        {searchQuery && (
          <p className="text-center text-sm text-secondary mb-md">
            {totalFilteredItems} {totalFilteredItems === 1 ? 'item' : 'items'} found for "{searchQuery}"
          </p>
        )}

        {/* Category Tabs - hide when searching */}
        {categories.length > 0 && !searchQuery && (
          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? "active" : ""}`}
                onClick={() => scrollToCategory(category)}
              >
                {category}
                <span className="category-count">({menuItems[category].length})</span>
              </button>
            ))}
          </div>
        )}

        {/* Menu Items by Category */}
        <div className="py-xl" style={{ paddingBottom: orders.length > 0 ? '120px' : '48px' }}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category}
                className="category-section"
                ref={(el) => (categoryRefs.current[category] = el)}
              >
                <h2 className="category-title">
                  {category}
                  <span className="badge badge-primary">{filteredItems[category].length}</span>
                </h2>

                <div className="stagger-children">
                  {filteredItems[category].map((item) => (
                    <div key={item.id} className="menu-item">
                      <div className="menu-item-info">
                        <div
                          className={
                            item.category?.toLowerCase().includes("veg") &&
                            !item.category?.toLowerCase().includes("non")
                              ? "veg-indicator"
                              : "nonveg-indicator"
                          }
                        />
                        <span className="menu-item-name">{item.name}</span>
                      </div>

                      <span className="menu-item-price">₹{item.price.toFixed(2)}</span>

                      <div>
                        {getQuantity(item) > 0 ? (
                          <div className="qty-stepper">
                            <button
                              className="qty-btn qty-btn-minus"
                              onClick={() => decreaseQuantity(item)}
                            >
                              −
                            </button>
                            <span className="qty-value">{getQuantity(item)}</span>
                            <button
                              className="qty-btn"
                              onClick={() => increaseQuantity(item)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                            Add +
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-3xl">
              <p style={{ fontSize: '60px', opacity: 0.3, marginBottom: '16px' }}>📋</p>
              <p className="text-xl font-semibold text-secondary">No menu items available</p>
              <p className="text-sm text-tertiary mt-sm">
                This restaurant hasn't added any items yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {orders.length > 0 && (
        <div className="floating-cart">
          <div className="floating-cart-info">
            <span className="floating-cart-count">{orders.length}</span>
            <div>
              <div className="floating-cart-label">Your Order</div>
              <div className="floating-cart-total">₹{getTotalPrice()}</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/carts")}>
            View Cart →
          </button>
        </div>
      )}
    </div>
    </PageTransition>
  );
};

export default MenuPage;
