import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { useFirebase } from "../context/Firebase";
import MyNavBar from "../components/Navbar";
import PageTransition from "../components/PageTransition";

const STATUSES = ["New", "Preparing", "Ready", "Delivered"];

const OrderTracking = () => {
  const { restaurantId, orderId } = useParams();
  const firebase = useFirebase();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!restaurantId || !orderId) return;

    const orderRef = doc(firebase.db, "restaurants", restaurantId, "orders", orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error tracking order:", error);
        setLoading(false);
        setNotFound(true);
      }
    );

    return () => unsubscribe();
  }, [firebase.db, restaurantId, orderId]);

  const currentStatusIndex = order ? STATUSES.indexOf(order.status || "New") : 0;
  const isDelivered = order?.status === "Delivered";

  return (
    <PageTransition>
      <div className="tracking-page">
        <MyNavBar />

        <div className="container py-xl">
          <h1 className="text-3xl font-extrabold text-center mb-sm">
            <span className="gradient-text">📍 Order Tracking</span>
          </h1>
          <p className="text-center text-secondary mb-xl">
            Live updates on your order
          </p>

          {loading ? (
            <div className="text-center py-3xl">
              <span className="spinner" style={{ margin: "0 auto" }} />
              <p className="text-secondary mt-md">Finding your order...</p>
            </div>
          ) : notFound ? (
            <div className="text-center py-3xl">
              <p style={{ fontSize: "60px", opacity: 0.3, marginBottom: "16px" }}>🔍</p>
              <p className="text-xl font-semibold text-secondary">Order not found</p>
              <p className="text-sm text-tertiary mt-sm">
                This order may have been delivered already
              </p>
              <a href="/" className="btn btn-primary mt-lg">
                Back to Home
              </a>
            </div>
          ) : (
            <div className="tracking-container animate-fadeInUp">
              {/* Status Stepper */}
              <div className="tracking-stepper">
                {STATUSES.map((status, index) => {
                  const isActive = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={status} className="tracking-step">
                      <div
                        className={`tracking-step-circle ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}
                      >
                        {isActive ? (
                          <span className="tracking-step-check">✓</span>
                        ) : (
                          <span className="tracking-step-number">{index + 1}</span>
                        )}
                      </div>
                      <span className={`tracking-step-label ${isActive ? "active" : ""}`}>
                        {status}
                      </span>
                      {index < STATUSES.length - 1 && (
                        <div className={`tracking-step-line ${index < currentStatusIndex ? "active" : ""}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Current Status Message */}
              <div className={`tracking-status-message ${isDelivered ? "delivered" : ""}`}>
                {order.status === "New" && (
                  <>
                    <span className="tracking-emoji">🆕</span>
                    <p className="text-lg font-bold">Order Received!</p>
                    <p className="text-secondary text-sm">
                      The restaurant has received your order and will start preparing it soon.
                    </p>
                  </>
                )}
                {order.status === "Preparing" && (
                  <>
                    <span className="tracking-emoji pulse-animation">👨‍🍳</span>
                    <p className="text-lg font-bold">Being Prepared</p>
                    <p className="text-secondary text-sm">
                      The chef is preparing your delicious food right now!
                    </p>
                  </>
                )}
                {order.status === "Ready" && (
                  <>
                    <span className="tracking-emoji bounce-animation">✅</span>
                    <p className="text-lg font-bold">Ready for Pickup!</p>
                    <p className="text-secondary text-sm">
                      Your food is ready. Head to the counter to collect it!
                    </p>
                  </>
                )}
                {(order.status === "Delivered" || !order.status) && isDelivered && (
                  <>
                    <span className="tracking-emoji">🎉</span>
                    <p className="text-lg font-bold">Delivered!</p>
                    <p className="text-secondary text-sm">
                      Enjoy your meal! Thank you for ordering with BlinkEat.
                    </p>
                  </>
                )}
                {!order.status && !isDelivered && (
                  <>
                    <span className="tracking-emoji">🆕</span>
                    <p className="text-lg font-bold">Order Received!</p>
                    <p className="text-secondary text-sm">
                      The restaurant has received your order.
                    </p>
                  </>
                )}
              </div>

              {/* Order Details Card */}
              <div className="card mt-xl">
                <div className="card-header">
                  <h3 className="text-lg font-bold">🧾 Order Details</h3>
                </div>
                <div className="card-body">
                  <p className="font-semibold mb-md">
                    Customer: <span className="text-primary">{order.customerName || "You"}</span>
                  </p>

                  <div className="flex flex-wrap gap-sm mb-lg">
                    {order.items?.map((item, i) => (
                      <span key={i} className="tag">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>

                  <div className="flex-between p-md rounded-md" style={{ background: "var(--color-bg-tertiary)" }}>
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-extrabold text-coral">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default OrderTracking;
