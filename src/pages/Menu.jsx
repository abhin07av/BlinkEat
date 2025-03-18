import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useFirebase } from "../context/Firebase";
import { useParams, useNavigate } from "react-router-dom";
import SignedNavBar from "../components/SignedinNav";
import MyNavBar from "../components/Navbar";
import OwnerNavBar from "../components/Ownernav";
import { Button } from "react-bootstrap";
import "./Main.css";

const MenuPage = () => {
    const firebase = useFirebase();
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState({});
    const [orders, setOrders] = useState(() => {
        return JSON.parse(sessionStorage.getItem("orders")) || [];
    });
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                console.log("Fetching menu for restaurant:", restaurantId);
                const menuRef = collection(firebase.db, `restaurants/${restaurantId}/menu`);
                const querySnapshot = await getDocs(menuRef);

                if (!querySnapshot.empty) {
                    // ✅ Group items by category
                    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const groupedItems = items.reduce((acc, item) => {
                        if (!acc[item.category]) acc[item.category] = [];
                        acc[item.category].push(item);
                        return acc;
                    }, {});
                    setMenuItems(groupedItems);
                } else {
                    console.warn("No menu items found for this restaurant.");
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

    // ✅ Function to add item to cart
    const addToCart = (item) => {
        const updatedOrders = [...orders, { ...item, quantity: 1 }];
        setOrders(updatedOrders);
        sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
    };

    // ✅ Function to increase quantity
    const increaseQuantity = (item) => {
        const updatedOrders = orders.map(order =>
            order.id === item.id ? { ...order, quantity: order.quantity + 1 } : order
        );

        setOrders(updatedOrders);
        sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
    };

    // ✅ Function to decrease quantity
    const decreaseQuantity = (item) => {
        const updatedOrders = orders.map(order =>
            order.id === item.id ? { ...order, quantity: order.quantity - 1 } : order
        ).filter(order => order.quantity > 0);

        setOrders(updatedOrders);
        sessionStorage.setItem("orders", JSON.stringify(updatedOrders));
    };

    // ✅ Function to get item quantity
    const getQuantity = (item) => {
        const existingOrder = orders.find(order => order.id === item.id);
        return existingOrder ? existingOrder.quantity : 0;
    };

    // ✅ Calculate total price
    const getTotalPrice = () => {
        return orders.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    return (
        <div className="peach">
            {/* ✅ Display appropriate navbar */}
            {!firebase.user && <MyNavBar />}
            
            {firebase.user && (isOwner ? <OwnerNavBar /> : <SignedNavBar />)}

            <div className="container-fluid min-vh-100 d-flex flex-column">
                <div className="container mt-4">
                    <h2 className="mb-4 text-center orangetext large underline">Restaurant Menu</h2>

                    {/* ✅ Display Category-Wise Menu */}
                    {Object.keys(menuItems).length > 0 ? (
                        Object.entries(menuItems).map(([category, items]) => (
                            <div key={category} className="mb-5">
                                <h3 className="large text-black">{category} ({items.length})</h3>
                                <div className="row">
                                    {items.map((item) => (
                                        <div key={item.id} className="menu orangetext background">
                                            <div>{item.name}</div>
                                            <div>₹{item.price.toFixed(2)}</div>
                                            <div className="d-flex align-items-center">
                                                {getQuantity(item) > 0 ? (
                                                    <>
                                                        <Button variant="danger" onClick={() => decreaseQuantity(item)}>-</Button>
                                                        <span className="mx-3">{getQuantity(item)}</span>
                                                        <Button variant="success" onClick={() => increaseQuantity(item)}>+</Button>
                                                    </>
                                                ) : (
                                                    <button className="button" onClick={() => addToCart(item)}>Order Now</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-white">No menu items available.</p>
                    )}

                    {/* ✅ Cart Section */}
                    {orders.length > 0 && (
                        <div className="cart py-4 d-flex justify-content-between align-items-center">
                            <h1 className="mr-1 text-white">🍽️ Your Orders</h1>
                            <div className="d-flex align-items-center">
                                <span className="text-white me-3">Total: ₹{getTotalPrice()}</span>
                                <button className="viewcart" onClick={() => navigate("/carts")}>
                                    View Cart ({orders.length})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuPage;
