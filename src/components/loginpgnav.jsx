import React from "react";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

const LoginpgNavBar = () => {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="w-100">
      <Container fluid>
        {/* ✅ Removed extra spaces and fixed alignment */}
        <Navbar.Brand href="https://blinkeat-32091.web.app">
          <div className="text-2xl font-bold text-white d-flex align-items-center">
            <span className="me-1">🍽️</span>
            BlinkEat
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Navbar.Brand href="https://blinkeat-32091.web.app/home">
            Home
          </Navbar.Brand>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default LoginpgNavBar;
