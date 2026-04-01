import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useToast } from "../components/Toast";
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import OwnerNavBar from "../components/Ownernav";

const Orders = () => {
  const firebase = useFirebase();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!firebase.user) return;

      try {
        const restaurantId = firebase.user.uid;
        const ordersRef = collection(firebase.db, "restaurants", restaurantId, "orders");
        const querySnapshot = await getDocs(ordersRef);

        const orderList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(orderList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [firebase.user, firebase.db]);

  const handleRemoveOrder = async (order) => {
    const restaurantId = firebase.user.uid;
    const orderRef = doc(firebase.db, "restaurants", restaurantId, "orders", order.id);
    const historyRef = collection(firebase.db, "restaurants", restaurantId, "orderHistory");

    try {
      await addDoc(historyRef, { ...order, timestamp: serverTimestamp() });
      await deleteDoc(orderRef);
      setOrders(orders.filter((o) => o.id !== order.id));
      toast.success("Order completed", `Order from ${order.customerName || "customer"} moved to history.`);
    } catch (error) {
      console.error("Error removing order:", error);
      toast.error("Error", "Failed to complete order. Please try again.");
    }
  };

  return (
    <div className="dashboard-page">
      <OwnerNavBar />

      <div className="container py-xl">
        <h1 className="text-3xl font-extrabold text-center mb-lg">
          <span className="gradient-text">📦 Active Orders</span>
        </h1>

        {loading ? (
          <div className="text-center py-3xl">
            <span className="spinner" style={{ margin: '0 auto' }} />
            <p className="text-secondary mt-md">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-3xl">
            <p style={{ fontSize: '60px', opacity: 0.3, marginBottom: '16px' }}>📦</p>
            <p className="text-xl font-semibold text-secondary">No active orders</p>
            <p className="text-sm text-tertiary mt-sm">New orders will appear here</p>
          </div>
        ) : (
          <div className="stagger-children">
            {orders.map((order, index) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="flex items-center gap-md">
                    <span className="text-lg font-bold">#{index + 1}</span>
                    <span className="order-status order-status-new">New Order</span>
                  </div>
                  <span className="text-sm text-tertiary">
                    {order.timestamp?.seconds
                      ? new Date(order.timestamp.seconds * 1000).toLocaleString()
                      : "Just now"}
                  </span>
                </div>

                <div className="flex-between items-start gap-lg" style={{ flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
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
                    <p className="text-2xl font-extrabold text-coral">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-md">
                    {order.paymentScreenshot ? (
                      <a
                        href={order.paymentScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        📷 View Payment
                      </a>
                    ) : (
                      <span className="text-sm text-tertiary">No screenshot</span>
                    )}

                    <button
                      className="btn btn-success"
                      onClick={() => handleRemoveOrder(order)}
                    >
                      ✅ Order Delivered
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
