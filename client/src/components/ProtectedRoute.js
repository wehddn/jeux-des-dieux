import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { hasMinimumRole } from "../utils/roleUtils";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useUserAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  // Check if user has required role or higher (both should be numeric)
  if (requiredRole && !hasMinimumRole(user.role, requiredRole)) {
    console.log("Access denied. User role ID:", user.role, "Required:", requiredRole);
    return <Navigate to="/no-access" />;
  }

  return children;
};

export { ProtectedRoute };
