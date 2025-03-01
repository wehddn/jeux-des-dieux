import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { getUserRole } from "../bd/Users.js";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useUserAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          console.log("user : ", user.id);
          const userRole = await getUserRole(user.id);
          setRole(userRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/no-access" />;
  }

  return children;
};

export { ProtectedRoute };
