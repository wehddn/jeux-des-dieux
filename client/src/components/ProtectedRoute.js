import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
const ProtectedRoute = ({ children }) => {
  const { user } = useUserAuth();

  if (!user) {
    return <Navigate to="/" />;
  } else if (user && !user.emailVerified) {
    return <Navigate to="/verify" />;
  }
  return children;
};

export { ProtectedRoute };