import React from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useFirebase } from "../context/Firebase";

const SignedNavBar = () => {
  const firebase = useFirebase();

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantId"); // Remove restaurant ID on logout
    sessionStorage.removeItem("orders"); // Remove orders on logout
    firebase.signOut(firebase.firebaseAuth);
  };

  const handleBlinkEat = () => {
    sessionStorage.removeItem("restaurantId"); // Remove restaurant ID on click
    sessionStorage.removeItem("orders"); // Remove orders on click
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="w-100">
      <Container fluid>
        {/* ✅ Fixed spacing and alignment */}
        <Navbar.Brand href="https://blinkeat-32091.web.app/" onClick={handleBlinkEat}>
          <div className="text-2xl font-bold text-white d-flex align-items-center">
            <span className="me-1">🍽️</span>
            BlinkEat
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="https://blinkeat-32091.web.app/home">Home</Nav.Link>
            <Nav.Link href="https://blinkeat-32091.web.app" onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default SignedNavBar;
