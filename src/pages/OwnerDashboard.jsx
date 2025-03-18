import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { collection, doc, getDoc, updateDoc, deleteDoc, addDoc, getDocs } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";  
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import OwnerNavBar from "../components/Ownernav";
import "./Owner.css";

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
  "Breakfast"
];

const OwnerDashboard = () => {
  const firebase = useFirebase();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [upiId, setUpiId] = useState("");

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

  // ✅ Add new item to selected category
  const handleAddMenuItem = async () => {
    if (!newItemName || !newItemPrice) return;

    const restaurantId = firebase.user.uid;
    const menuRef = collection(firebase.db, "restaurants", restaurantId, "menu");

    const newItem = {
      name: newItemName,
      price: parseFloat(newItemPrice),
      category: selectedCategory
    };

    const docRef = await addDoc(menuRef, newItem);
    
    setMenu({
      ...menu,
      [selectedCategory]: [...(menu[selectedCategory] || []), { id: docRef.id, ...newItem }]
    });

    setNewItemName("");
    setNewItemPrice("");
  };

  // ✅ Delete item within category
  const handleDeleteMenuItem = async (id, category) => {
    const itemRef = doc(firebase.db, "restaurants", firebase.user.uid, "menu", id);
    await deleteDoc(itemRef);
    
    setMenu({
      ...menu,
      [category]: menu[category].filter(item => item.id !== id)
    });
  };

  // ✅ Update UPI ID
  const handleUpdateUPI = async () => {
    if (!upiId) {
      alert("Please enter a valid UPI ID.");
      return;
    }

    const restaurantRef = doc(firebase.db, "restaurants", firebase.user.uid);
    await updateDoc(restaurantRef, { upiId });

    alert("UPI ID updated successfully!");
  };

  return (
    <div>
      <OwnerNavBar />
      <div className="container p-4">
        <h1 className="text-center mb-4">Owner Dashboard</h1>
        
        {restaurant && (
          <div className="bg-light p-4 rounded mb-3 text-center">
            <h2 className="mb-3">Restaurant Name: {restaurant.name}</h2>
            <QRCodeCanvas 
              value={`https://blinkeat-32091.web.app//menu/${firebase.user.uid}`} 
              size={150} 
              className="mb-3 mx-auto d-block" 
            />
          </div>
        )}

        {/* ✅ UPI ID Section */}
        <h2 className="mb-3">Payment Settings</h2>
        <div className="d-flex">
          <Form.Control
            type="text"
            placeholder="Enter UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="me-2"
          />
          <Button variant="success" onClick={handleUpdateUPI}>
            Update UPI ID
          </Button>
        </div>
        {upiId && <p className="mt-2">Current UPI ID: <strong>{upiId}</strong></p>}

        {/* ✅ Display Menu by Category */}
        {categories.map((category) => (
          <div key={category} className="mt-4">
            <h2 className="mb-3">{category} ({menu[category]?.length || 0})</h2>
            {menu[category]?.map((item) => (
              <div key={item.id} className="bg-light p-3 rounded mb-3 d-flex justify-content-between align-items-center">
                <div className="ms-3">{item.name}</div>
                <div className="d-flex align-items-center">
                  <div className="me-3">₹{item.price.toFixed(2)}</div>
                  <Button 
                    variant="dark" 
                    onClick={() => handleDeleteMenuItem(item.id, category)}
                    className="rounded"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* ✅ Add New Item */}
        <h2 className="mt-5 mb-3">Add New Menu Item</h2>
        <div className="d-flex " style={{ gap: "10px" }}>
          <Form.Control
            type="text"
            placeholder="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="me-2"
          />
          <div style={{ width: "150px" }}>
            <Form.Control
              type="number"
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
            />
          </div>
          <Form.Select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            className="me-2"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Form.Select>
          <Button 
            variant="dark" 
            onClick={handleAddMenuItem}
          >
            Add Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
