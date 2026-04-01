import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useToast } from "../components/Toast";
import axios from "axios";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";
import SignedNavBar from "../components/SignedinNav";
import PageTransition from "../components/PageTransition";

const PlaceOrder = () => {
  const firebase = useFirebase();
  const toast = useToast();
  const [orders, setOrders] = useState(() => JSON.parse(sessionStorage.getItem("orders")) || []);
  const [upiId, setUpiId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [placedRestaurantId, setPlacedRestaurantId] = useState(null);

  useEffect(() => {
    const fetchRestaurantUPI = async () => {
      const restaurantId = sessionStorage.getItem("restaurantId");
      if (!restaurantId) return;

      try {
        const restaurantRef = doc(firebase.db, "restaurants", restaurantId);
        const restaurantSnap = await getDoc(restaurantRef);
        if (restaurantSnap.exists()) {
          const data = restaurantSnap.data();
          setUpiId(data.upiId || null);
          setRestaurantName(data.name || "Restaurant");
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      }
    };

    fetchRestaurantUPI();
  }, [firebase.db]);

  const getTotalPrice = () =>
    orders.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getUPIURL = () => {
    if (!upiId) return null;
    return `upi://pay?pa=${upiId}&pn=${restaurantName}&am=${getTotalPrice()}&cu=INR`;
  };

  const handleUPIPayment = () => {
    const upiURL = getUPIURL();
    if (upiURL) {
      window.open(upiURL, "_blank");
    } else {
      toast.warning("UPI not available", "This restaurant hasn't set up UPI payments yet.");
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Storeimage");
    formData.append("cloud_name", "du8l5qukg");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/du8l5qukg/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return null;
    }
  };

  const confirmPayment = async () => {
    const userId = sessionStorage.getItem("userId");
    const restaurantId = sessionStorage.getItem("restaurantId");

    if (!userId || !restaurantId) {
      toast.error("Session expired", "Please log in again to continue.");
      return;
    }

    if (!screenshot) {
      toast.warning("Screenshot required", "Please upload a payment screenshot before confirming.");
      return;
    }

    if (!customerName.trim()) {
      toast.warning("Name required", "Please enter your name before confirming.");
      return;
    }

    setUploading(true);

    let screenshotURL = "";
    try {
      screenshotURL = await uploadToCloudinary(screenshot);
      if (!screenshotURL) {
        toast.error("Upload failed", "Failed to upload screenshot. Please try again.");
        setUploading(false);
        return;
      }
    } catch (error) {
      toast.error("Upload failed", "Failed to upload screenshot. Please try again.");
      setUploading(false);
      return;
    }

    try {
      const orderData = {
        userId,
        restaurantId,
        customerName,
        items: orders,
        totalAmount: getTotalPrice(),
        paymentStatus: "Paid",
        paymentScreenshot: screenshotURL,
        timestamp: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(firebase.db, `restaurants/${restaurantId}/orders`), orderData);
      
      setPlacedOrderId(orderRef.id);
      setPlacedRestaurantId(restaurantId);
      
      sessionStorage.removeItem("orders");
      setOrders([]);
      setCustomerName("");
      setOrderPlaced(true);
      toast.success("Order placed!", "Your order has been placed successfully. 🎉");
    } catch (error) {
      console.error("Error storing order:", error);
      toast.error("Order failed", "Failed to confirm payment. Please try again.");
    }

    setUploading(false);
  };

  // Order success screen
  if (orderPlaced) {
    return (
      <PageTransition>
        <div className="checkout-page">
          <SignedNavBar />
          <div className="container flex-center" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
            <div className="text-center animate-scaleIn" style={{ maxWidth: '400px' }}>
              <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎉</div>
              <h2 className="text-3xl font-extrabold mb-md gradient-text">Order Placed!</h2>
              <p className="text-secondary mb-xl">
                Your order at <strong className="text-primary">{restaurantName}</strong> has been 
                confirmed. The restaurant will start preparing your food shortly.
              </p>
              <div className="flex flex-col gap-md">
                {placedOrderId && placedRestaurantId && (
                  <Link
                    to={`/track-order/${placedRestaurantId}/${placedOrderId}`}
                    className="btn btn-primary btn-lg"
                  >
                    📍 Track Your Order
                  </Link>
                )}
                <Link to="/" className="btn btn-ghost btn-lg">
                  Back to Restaurants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="checkout-page">
      <SignedNavBar />

      <div className="container py-xl">
        <div className="checkout-card animate-fadeInUp">
          {/* Header */}
          <div className="checkout-header">
            <h2 className="checkout-title">
              🧾 <span className="gradient-text">Order Summary</span>
            </h2>
            <p className="text-secondary text-sm mt-sm">
              Ordering from <strong>{restaurantName}</strong>
            </p>
          </div>

          {/* Body */}
          <div className="checkout-body">
            {/* Order Table */}
            <div className="table-wrapper mb-lg">
              <table className="table table-center">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ textAlign: 'left' }}>Dish</th>
                    <th>Qty</th>
                    <th>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td style={{ textAlign: 'left', fontWeight: 500 }}>{item.name}</td>
                      <td>
                        <span className="badge badge-primary">{item.quantity}</span>
                      </td>
                      <td className="font-semibold">{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex-between p-md rounded-md" style={{ background: 'var(--color-bg-tertiary)' }}>
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-extrabold text-coral">₹{getTotalPrice()}</span>
            </div>

            {/* Customer Name */}
            <div className="form-group mt-lg">
              <label className="form-label">
                Your Name <span className="form-required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            {/* UPI QR Code */}
            {upiId && (
              <div className="qr-section">
                <h3 className="text-lg font-bold mb-sm">📱 Scan to Pay</h3>
                <p className="text-secondary text-sm mb-md">
                  Scan this QR code with any UPI app
                </p>
                <QRCodeCanvas value={getUPIURL()} size={180} className="mx-auto" />
                <p className="text-xs text-tertiary mt-md">
                  UPI ID: {upiId}
                </p>
              </div>
            )}

            {/* Screenshot Upload */}
            <div className="form-group mt-lg">
              <label className="form-label">
                Payment Screenshot <span className="form-required">*</span>
              </label>
              <label className="upload-area">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {screenshotPreview ? (
                  <div>
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        margin: '0 auto',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                    <p className="text-sm text-success mt-sm">✓ Screenshot uploaded — click to change</p>
                  </div>
                ) : (
                  <div>
                    <div className="upload-icon">📸</div>
                    <p className="font-semibold text-secondary">Click to upload payment screenshot</p>
                    <p className="text-xs text-tertiary mt-sm">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </label>
            </div>

            {uploading && (
              <div className="flex-center gap-sm py-md">
                <span className="spinner spinner-sm" />
                <span className="text-warning text-sm">Uploading & placing order...</span>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="checkout-footer">
            {upiId && (
              <button className="btn btn-accent btn-lg" onClick={handleUPIPayment}>
                📱 Pay Now via UPI
              </button>
            )}
            <button
              className="btn btn-success btn-lg"
              onClick={confirmPayment}
              disabled={uploading}
            >
              {uploading ? "Processing..." : "✅ Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default PlaceOrder;
