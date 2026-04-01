import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { collection, getDocs } from "firebase/firestore";
import OwnerNavBar from "../components/Ownernav";

const OrderHistory = () => {
  const firebase = useFirebase();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!firebase.user) return;

      try {
        const restaurantId = firebase.user.uid;
        const historyRef = collection(firebase.db, "restaurants", restaurantId, "orderHistory");
        const querySnapshot = await getDocs(historyRef);

        const historyList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistory(historyList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching history:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [firebase.user, firebase.db]);

  const filteredHistory = history.filter((order) =>
    (order.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items?.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="dashboard-page">
      <OwnerNavBar />

      <div className="container py-xl">
        <h1 className="text-3xl font-extrabold text-center mb-sm">
          <span className="gradient-text">📜 Order History</span>
        </h1>
        <p className="text-center text-secondary mb-xl">
          {history.length} total orders
        </p>

        {/* Search */}
        {history.length > 0 && (
          <div className="search-bar mx-auto mb-xl" style={{ maxWidth: '400px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by customer or dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-3xl">
            <span className="spinner" style={{ margin: '0 auto' }} />
            <p className="text-secondary mt-md">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-3xl">
            <p style={{ fontSize: '60px', opacity: 0.3, marginBottom: '16px' }}>📜</p>
            <p className="text-xl font-semibold text-secondary">No past orders</p>
            <p className="text-sm text-tertiary mt-sm">
              Completed orders will appear here
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: Table View */}
            <div className="show-desktop-only">
              <div className="table-wrapper animate-fadeInUp">
                <table className="table table-center">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th style={{ textAlign: 'left' }}>Customer</th>
                      <th style={{ textAlign: 'left' }}>Order Details</th>
                      <th>Total (₹)</th>
                      <th>Payment</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((order, index) => (
                      <tr key={order.id}>
                        <td>{index + 1}</td>
                        <td style={{ textAlign: 'left' }}>
                          <span className="font-semibold">{order.customerName || "Unknown"}</span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <div className="flex flex-wrap gap-xs">
                            {order.items.map((item, i) => (
                              <span key={i} className="tag">{item.name} × {item.quantity}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="font-bold text-coral">₹{order.totalAmount}</span>
                        </td>
                        <td>
                          {order.paymentScreenshot ? (
                            <a
                              href={order.paymentScreenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-sm"
                            >
                              📷 View
                            </a>
                          ) : (
                            <span className="text-tertiary text-xs">None</span>
                          )}
                        </td>
                        <td>
                          <span className="text-xs text-secondary">
                            {order.timestamp?.seconds
                              ? new Date(order.timestamp.seconds * 1000).toLocaleString()
                              : "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: Card View */}
            <div className="show-mobile-only stagger-children">
              {filteredHistory.map((order, index) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <span className="font-bold">#{index + 1}</span>
                    <span className="order-status order-status-completed">Completed</span>
                  </div>

                  <p className="font-bold text-lg mb-sm">
                    {order.customerName || "Unknown"}
                  </p>

                  <div className="flex flex-wrap gap-xs mb-md">
                    {order.items.map((item, i) => (
                      <span key={i} className="tag">{item.name} × {item.quantity}</span>
                    ))}
                  </div>

                  <div className="flex-between">
                    <span className="text-xl font-extrabold text-coral">
                      ₹{order.totalAmount}
                    </span>
                    <span className="text-xs text-tertiary">
                      {order.timestamp?.seconds
                        ? new Date(order.timestamp.seconds * 1000).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>

                  {order.paymentScreenshot && (
                    <a
                      href={order.paymentScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm mt-md"
                    >
                      📷 View Payment Screenshot
                    </a>
                  )}
                </div>
              ))}
            </div>

            {filteredHistory.length === 0 && searchQuery && (
              <div className="text-center py-xl">
                <p className="text-secondary">
                  No orders matching "{searchQuery}"
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
