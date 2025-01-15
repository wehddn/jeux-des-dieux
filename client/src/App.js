import React from "react";
import { Container } from "react-bootstrap";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./Modal.css";
import "./components/Games/Game.css";
import "./components/Settings/Settings.css";
import "./components/Profile/Profile.css";
import "./components/base/Header/Header.css";
import "./components/Rules/Rules.css";
import "./components/base/Footer/Footer.css";
import Header from "./components/base/Header/Header";
import Profile from "./components/Profile/Profile";
import Games from "./components/Games/Games";
import Game from "./components/Games/Game/Game";
import PrivateRoute from "./components/Routes/PrivateRoute";
import GameRoom from "./components/Games/GameRoom";
import Settings from "./components/Settings/Settings";
import Rules from "./components/Rules/Rules";
import Login from "./components/Authorization/Login";
import Signup from "./components/Authorization/Signup";
import EmailVerification from "./components/Authorization/EmailVerification";
import ForgotPassword from "./components/Authorization/ForgotPassword";
import AdminPage from "./components/Admin/Admin";
import NoAccess from "./components/base/NoAccess/NoAccess";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import 'boxicons/css/boxicons.min.css';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const noHeaderRoutes = ["/room/:id", "/signup", "/verify", "/forgot-password", "/"];
  
  const shouldShowHeader = !noHeaderRoutes.includes(location.pathname);
  
  return (
    <>
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
};

function App() {
  return (
    <div className="App-wrapper">
      <div className="App-overlay" aria-hidden="true"></div>
      <main className="App-content">
      <AppLayout>
        <Container>
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
                    path="/rules"
                    element={
                      <ProtectedRoute>
                        <Rules />
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
                    path="/room/:id"
                    element={
                      <PrivateRoute>
                        <GameRoom />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/no-access" element={<NoAccess />} />
                  <Route path="/" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify" element={<EmailVerification />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
              </UserAuthContextProvider>
        </Container>
      </AppLayout>
      </main>
    </div>
  );
}

export default App;
