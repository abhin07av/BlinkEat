import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const FirebaseContext = createContext(null);

const firebaseConfig = {
    apiKey: "AIzaSyCWF9VuvPdkXs4jqNpc5NcCyC1_oM2waAM",
    authDomain: "blinkeat-32091.firebaseapp.com",
    projectId: "blinkeat-32091",
    storageBucket: "blinkeat-32091.firebasestorage.app",
    messagingSenderId: "644520510122",
    appId: "1:644520510122:web:38d63dff721e803f3406d3"
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [items, setItems] = useState(0);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUser(user);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const role = userDoc.data().role;
                    setRole(role);
    
                    // ✅ Store userId and role in sessionStorage
                    sessionStorage.setItem("userId", user.uid);
                    sessionStorage.setItem("role", role);
                }
            } else {
                setUser(null);
                setRole(null);
    
                // ✅ Clear sessionStorage when user logs out
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("role");
            }
        });
    }, []);
    
    const getUserData = async (uid) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists) {
            return userDoc.data();
        }
        return null;
    };

    const signup = async (email, password, role = "customer") => {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;

        // Save user role in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            role: role
        });

        setRole(role);
        return user;
    };

    const signin = (email, password) => signInWithEmailAndPassword(firebaseAuth, email, password);

    const signinWithGoogle = async () => {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: "customer"
            });
        }

        return user;
    };

    // ✅ Function to Update Order Status
    const updateOrderStatus = async (orderId, newStatus) => {
        if (!user || role !== "owner") return;
        const orderRef = doc(db, "restaurants", user.uid, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus });
    };

    const isLoggedIn = user ? true : false;

    return (
        <FirebaseContext.Provider value={{
            signup, signin, signinWithGoogle, signOut, firebaseAuth, db, user,
            isLoggedIn, role, items, setItems, getUserData, orders,setOrders, updateOrderStatus
        }}>
            {props.children}
        </FirebaseContext.Provider>
    );
};