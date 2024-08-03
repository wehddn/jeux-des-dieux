import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import "./components/Games/Game.css";
import Profile from "./components/Profile/Profile";
import Games from "./components/Games/Games";
import Game from "./components/Games/Game";
import GameRoom from "./components/Games/GameRoom"
import Settings from "./components/Settings/Settings";
import Login from "./components/Authorization/Login";
import Signup from "./components/Authorization/Signup";
import EmailVerification from "./components/Authorization/EmailVerification";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";

function App() {
  return (
    <div className="App-header">
      <div className="App-overlay"></div>
      <div className="App-content">
        <Container>
          <Row>
            <Col>
              <UserAuthContextProvider>
                <Routes>
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/games"
                    element={
                      <ProtectedRoute>
                        <Games />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/games/game"
                    element={
                      <ProtectedRoute>
                        <Game />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/games/gameroom"
                    element={
                      <ProtectedRoute>
                        <GameRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify" element={<EmailVerification />} />
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
