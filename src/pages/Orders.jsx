import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useToast } from "../components/Toast";
import { collection, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import OwnerNavBar from "../components/Ownernav";
import PageTransition from "../components/PageTransition";

const STATUSES = ["New", "Preparing", "Ready", "Delivered"];

const Orders = () => {
  const firebase = useFirebase();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener
  useEffect(() => {
    if (!firebase.user) return;

    const restaurantId = firebase.user.uid;
    const ordersRef = collection(firebase.db, "restaurants", restaurantId, "orders");

    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(orderList);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebase.user, firebase.db]);

  const handleUpdateStatus = async (order, newStatus) => {
    const restaurantId = firebase.user.uid;
    const orderRef = doc(firebase.db, "restaurants", restaurantId, "orders", order.id);

    try {
      if (newStatus === "Delivered") {
        // Move to history
        const historyRef = collection(firebase.db, "restaurants", restaurantId, "orderHistory");
        await addDoc(historyRef, { ...order, status: "Delivered", timestamp: serverTimestamp() });
        await deleteDoc(orderRef);
        toast.success("Order delivered", `Order from ${order.customerName || "customer"} completed.`);
      } else {
        await updateDoc(orderRef, { status: newStatus });
        toast.info("Status updated", `Order moved to "${newStatus}".`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error", "Failed to update order status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "order-status-new";
      case "Preparing": return "order-status-preparing";
      case "Ready": return "order-status-ready";
      default: return "order-status-new";
    }
  };

  const getNextStatus = (currentStatus) => {
    const idx = STATUSES.indexOf(currentStatus || "New");
    return idx < STATUSES.length - 1 ? STATUSES[idx + 1] : null;
  };

  return (
    <PageTransition>
      <div className="dashboard-page">
        <OwnerNavBar />

        <div className="container py-xl">
          <h1 className="text-3xl font-extrabold text-center mb-sm">
            <span className="gradient-text">📦 Active Orders</span>
          </h1>
          <p className="text-center text-secondary mb-lg">
            {orders.length > 0 && <span className="live-dot" />}
            {orders.length > 0 ? " Live updates enabled" : "Waiting for orders..."}
          </p>

          {loading ? (
            <div className="text-center py-3xl">
              <span className="spinner" style={{ margin: "0 auto" }} />
              <p className="text-secondary mt-md">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-3xl">
              <p style={{ fontSize: "60px", opacity: 0.3, marginBottom: "16px" }}>📦</p>
              <p className="text-xl font-semibold text-secondary">No active orders</p>
              <p className="text-sm text-tertiary mt-sm">New orders will appear here automatically</p>
            </div>
          ) : (
            <div className="stagger-children">
              {orders.map((order, index) => {
                const currentStatus = order.status || "New";
                const nextStatus = getNextStatus(currentStatus);

                return (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="flex items-center gap-md">
                        <span className="text-lg font-bold">#{index + 1}</span>
                        <span className={`order-status ${getStatusColor(currentStatus)}`}>
                          {currentStatus}
                        </span>
                      </div>
                      <span className="text-sm text-tertiary">
                        {order.timestamp?.seconds
                          ? new Date(order.timestamp.seconds * 1000).toLocaleString()
                          : "Just now"}
                      </span>
                    </div>

                    <div className="flex-between items-start gap-lg" style={{ flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <p className="font-bold text-lg mb-sm">
                          {order.customerName || "Unknown Customer"}
                        </p>
                        <div className="flex flex-wrap gap-sm mb-md">
                          {order.items.map((item, i) => (
                            <span key={i} className="tag">
                              {item.name} × {item.quantity}
                            </span>
                          ))}
                        </div>
                        <p className="text-2xl font-extrabold text-coral">₹{order.totalAmount}</p>
                      </div>

                      <div className="flex flex-col items-end gap-sm">
                        {order.paymentScreenshot && (
                          <a
                            href={order.paymentScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                          >
                            📷 View Payment
                          </a>
                        )}

                        {/* Status progression buttons */}
                        <div className="order-actions">
                          {STATUSES.slice(1).map((status) => {
                            const statusIdx = STATUSES.indexOf(status);
                            const currentIdx = STATUSES.indexOf(currentStatus);
                            const isNext = status === nextStatus;
                            const isPast = statusIdx <= currentIdx;

                            return (
                              <button
                                key={status}
                                className={`btn btn-sm ${
                                  isPast
                                    ? "btn-ghost"
                                    : isNext
                                    ? status === "Delivered"
                                      ? "btn-success"
                                      : "btn-accent"
                                    : "btn-ghost"
                                }`}
                                disabled={isPast || !isNext}
                                onClick={() => handleUpdateStatus(order, status)}
                                style={{ opacity: isPast ? 0.4 : isNext ? 1 : 0.5 }}
                              >
                                {status === "Preparing" && "👨‍🍳 "}
                                {status === "Ready" && "✅ "}
                                {status === "Delivered" && "🎉 "}
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Orders;
