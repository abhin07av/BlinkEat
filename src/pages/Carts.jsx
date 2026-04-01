import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import MyNavBar from "../components/Navbar";
import SignedNavBar from "../components/SignedinNav";
import OwnerNavBar from "../components/Ownernav";

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

  const getTotalPrice = () => {
    return orders.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const updateQuantity = (itemId, delta) => {
    const updatedOrders = orders
      .map((order) =>
        order.id === itemId ? { ...order, quantity: order.quantity + delta } : order
      )
      .filter((order) => order.quantity > 0);
    setOrders(updatedOrders);
    sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const removeItem = (itemId) => {
    const updatedOrders = orders.filter((order) => order.id !== itemId);
    setOrders(updatedOrders);
    sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const restaurantId = sessionStorage.getItem("restaurantId");

  return (
    <div className="cart-page">
      {!isLoggedIn && <MyNavBar />}
      {isLoggedIn && !isOwner && <SignedNavBar />}
      {isLoggedIn && isOwner && <OwnerNavBar />}

      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="py-2xl">
          <h1 className="text-3xl font-extrabold text-center mb-lg animate-fadeInUp">
            <span className="gradient-text">Your Cart</span>
          </h1>

          {orders.length > 0 ? (
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              {/* Cart Items */}
              <div className="cart-items">
                {orders.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-qty">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-md">
                      <div className="qty-stepper">
                        <button
                          className="qty-btn qty-btn-minus"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-price">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        className="btn btn-ghost btn-icon-sm"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                        style={{ color: 'var(--color-error)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span className="text-secondary">Subtotal ({orders.length} items)</span>
                  <span className="font-semibold">₹{getTotalPrice()}</span>
                </div>
                <div className="cart-summary-row border-t" style={{ paddingTop: '12px', marginTop: '8px' }}>
                  <span className="text-lg font-bold">Total</span>
                  <span className="cart-summary-total">₹{getTotalPrice()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="cart-actions">
                <button
                  className="btn btn-primary btn-lg flex-1"
                  onClick={() => {
                    navigate(isLoggedIn ? "/placeorder" : "/login");
                    if (!isLoggedIn) {
                      // Toast will be shown after redirect to login
                    }
                  }}
                >
                  {isLoggedIn ? "Proceed to Checkout →" : "Sign in to Order →"}
                </button>

                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    if (restaurantId) {
                      navigate(`/menu/${restaurantId}`);
                    }
                  }}
                >
                  ← Modify Order
                </button>
              </div>
            </div>
          ) : (
            <div className="cart-empty animate-fadeInUp">
              <div className="cart-empty-icon">🛒</div>
              <h2 className="cart-empty-title">Your cart is empty</h2>
              <p className="cart-empty-text">
                Looks like you haven't added anything to your cart yet. Browse a restaurant menu to get started!
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/")}>
                Browse Restaurants
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carts;
