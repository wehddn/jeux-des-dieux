import React from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/page_auth/Login";
import Signup from "./pages/page_auth/Signup";
import { LoggedRoute, VerifiedRoute } from "./components/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";

function App() {

  return (
    <Container style={{ width: "400px" }}>
      <Row>
        <Col>
          <UserAuthContextProvider>
            <Routes>
              <Route
                path="/home"
                element={
                  <LoggedRoute>
                    <Home />
                  </LoggedRoute>
                }
              />
              <Route
                path="/verify"
                element={
                  <VerifiedRoute>
                    
                  </VerifiedRoute>
                }
              />
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </UserAuthContextProvider>
        </Col>
      </Row>
    </Container>
  );
}

export default App;