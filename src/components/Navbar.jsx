import React from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useFirebase } from "../context/Firebase";

const MyNavBar = () => {
  const firebase = useFirebase();

  const handleBlinkeat = () => {
    sessionStorage.removeItem("restaurantId");
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="w-100">
      <Container fluid>
        {/* ✅ Removed extra space in href */}
        <Navbar.Brand href="https://blinkeat-32091.web.app/" onClick={handleBlinkeat}>
          <div className="text-2xl font-bold text-white d-flex align-items-center">
            <span className="me-1">🍽️</span>
            BlinkEat
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto"> 
            <Nav.Link href="https://blinkeat-32091.web.app/home">Home</Nav.Link>
            <Nav.Link href="https://blinkeat-32091.web.app/register">Register</Nav.Link>
            <Nav.Link href="https://blinkeat-32091.web.app/login">Sign In</Nav.Link>
            <Nav.Link href="https://blinkeat-32091.web.app/loginowner" onClick={() => firebase.setowner(true)}>
              Sign In as Owner
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavBar;
