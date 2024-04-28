import React from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/page_auth/Login";
import Signup from "./pages/page_auth/Signup";
import VerifyPage from "./pages/page_auth/VerifyPage";
import { ProtectedRoute, UnverifiedRoute } from "./components/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";

function App() {

  return (
    <div className='App-header'>
      <div className='App-overlay'></div>
      <div className='App-content'>
        <Container>
          <Row>
            <Col>
              <UserAuthContextProvider>
                <Routes>
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify" element={<VerifyPage />} />
                </Routes>
              </UserAuthContextProvider>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default App;