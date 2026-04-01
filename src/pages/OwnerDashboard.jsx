import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { useToast } from "../components/Toast";
import { collection, doc, getDoc, updateDoc, deleteDoc, addDoc, getDocs } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import OwnerNavBar from "../components/Ownernav";

const categories = [
  "Non Veg Main Course",
  "Fried Rice",
  "Rice And Biryani",
  "Veg Main Course",
  "Non Veg Starters",
  "Chinese Appetizer",
  "Veg Starters",
  "Noodles",
  "Breads",
  "Soup",
  "Breakfast",
];

const OwnerDashboard = () => {
  const firebase = useFirebase();
  const toast = useToast();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [upiId, setUpiId] = useState("");
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (firebase.user) {
        const restaurantRef = doc(firebase.db, "restaurants", firebase.user.uid);
        const restaurantSnap = await getDoc(restaurantRef);
        sessionStorage.setItem("restaurantId", firebase.user.uid);

        if (restaurantSnap.exists()) {
          setRestaurant(restaurantSnap.data());
          setUpiId(restaurantSnap.data().upiId || "");
          fetchMenu(firebase.user.uid);
        }
      }
    };

    const fetchMenu = async (restaurantId) => {
      const menuRef = collection(firebase.db, "restaurants", restaurantId, "menu");
      const menuSnapshot = await getDocs(menuRef);

      const menuData = {};
      categories.forEach((category) => (menuData[category] = []));

      menuSnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (menuData[item.category]) {
          menuData[item.category].push(item);
        }
      });

      setMenu(menuData);
    };

    fetchRestaurantData();
  }, [firebase.user, firebase.db]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleAddMenuItem = async () => {
    if (!newItemName || !newItemPrice) {
      toast.warning("Missing fields", "Please enter both item name and price.");
      return;
    }

    const restaurantId = firebase.user.uid;
    const menuRef = collection(firebase.db, "restaurants", restaurantId, "menu");

    const newItem = {
      name: newItemName,
      price: parseFloat(newItemPrice),
      category: selectedCategory,
    };

    const docRef = await addDoc(menuRef, newItem);

    setMenu({
      ...menu,
      [selectedCategory]: [...(menu[selectedCategory] || []), { id: docRef.id, ...newItem }],
    });

    setNewItemName("");
    setNewItemPrice("");
    toast.success("Item added", `${newItemName} has been added to ${selectedCategory}.`);
  };

  const handleDeleteMenuItem = async (id, category, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    const itemRef = doc(firebase.db, "restaurants", firebase.user.uid, "menu", id);
    await deleteDoc(itemRef);

    setMenu({
      ...menu,
      [category]: menu[category].filter((item) => item.id !== id),
    });

    toast.success("Item deleted", `${itemName} has been removed.`);
  };

  const handleUpdateUPI = async () => {
    if (!upiId) {
      toast.warning("Invalid UPI ID", "Please enter a valid UPI ID.");
      return;
    }

    const restaurantRef = doc(firebase.db, "restaurants", firebase.user.uid);
    await updateDoc(restaurantRef, { upiId });
    toast.success("UPI Updated", "Your UPI ID has been updated successfully.");
  };

  const totalItems = Object.values(menu).reduce((sum, items) => sum + items.length, 0);
  const activeCategories = Object.values(menu).filter((items) => items.length > 0).length;

  return (
    <div className="dashboard-page">
      <OwnerNavBar />

      <div className="container py-xl">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="text-4xl font-extrabold mb-sm">
            <span className="gradient-text">Owner Dashboard</span>
          </h1>
          {restaurant && (
            <p className="text-secondary text-lg">
              Managing <strong className="text-primary">{restaurant.name}</strong>
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats stagger-children">
          <div className="stat-card">
            <div className="stat-value gradient-text">{totalItems}</div>
            <div className="stat-label">Menu Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-accent">{activeCategories}</div>
            <div className="stat-label">Active Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: upiId ? 'var(--color-success)' : 'var(--color-error)' }}>
              {upiId ? "✓" : "✕"}
            </div>
            <div className="stat-label">UPI {upiId ? "Active" : "Not Set"}</div>
          </div>
        </div>

        {/* QR Code Section */}
        {restaurant && (
          <div className="dashboard-qr animate-fadeInUp">
            <h3 className="text-xl font-bold mb-sm">📱 Your Restaurant QR Code</h3>
            <p className="text-secondary text-sm mb-md">
              Customers can scan this to view your menu directly
            </p>
            <QRCodeCanvas
              value={`https://blinkeat-32091.web.app/menu/${firebase.user.uid}`}
              size={180}
            />
            <p className="text-xs text-tertiary mt-md">{restaurant.name}</p>
          </div>
        )}

        {/* Payment Settings */}
        <div className="card mb-xl">
          <div className="card-header">
            <h3 className="text-lg font-bold">💳 Payment Settings</h3>
          </div>
          <div className="card-body">
            <div className="flex gap-md items-end" style={{ flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">UPI ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              <button className="btn btn-success" onClick={handleUpdateUPI}>
                Update UPI
              </button>
            </div>
            {upiId && (
              <p className="text-sm text-success mt-md">
                ✓ Current UPI: <strong>{upiId}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Menu Management — Collapsible Categories */}
        <h2 className="text-2xl font-extrabold mb-lg">📋 Menu Management</h2>

        <div className="stagger-children">
          {categories.map((category) => {
            const items = menu[category] || [];
            const isOpen = openCategories[category];

            return (
              <div key={category} className="collapsible">
                <button
                  className="collapsible-header"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="collapsible-title">
                    {category}
                    <span className="badge badge-primary">{items.length}</span>
                  </span>
                  <span className={`collapsible-arrow ${isOpen ? "open" : ""}`}>
                    ▾
                  </span>
                </button>

                <div className={`collapsible-content ${isOpen ? "open" : ""}`}>
                  <div className="collapsible-body">
                    {items.length > 0 ? (
                      items.map((item) => (
                        <div key={item.id} className="dashboard-menu-item">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-md">
                            <span className="text-coral font-bold">₹{item.price.toFixed(2)}</span>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteMenuItem(item.id, category, item.name)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-tertiary text-sm text-center py-md">
                        No items in this category
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Item */}
        <div className="add-item-form animate-fadeInUp">
          <h3 className="text-xl font-bold mb-lg">➕ Add New Menu Item</h3>
          <div className="add-item-form-grid">
            <div>
              <label className="form-label">Item Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Butter Chicken"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="299"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAddMenuItem}>
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
