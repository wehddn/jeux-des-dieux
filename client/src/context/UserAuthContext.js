import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticatedRooms, setAuthenticatedRooms] = useState(
    JSON.parse(localStorage.getItem("authenticatedRooms")) || []
  );

  // Lors de l'initialisation, nous vérifions la présence du token dans localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // JWT utilise 'sub' pour l'ID utilisateur, nous le convertissons pour plus de commodité
        const user = {
          id: decodedUser.sub,
          role: decodedUser.role,
          iat: decodedUser.iat,
          exp: decodedUser.exp
        };
        setUser(user);
      } catch (error) {
        console.error("Erreur de décodage du token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  async function logIn(email, password) {
    try {
      const response = await axios.post("http://localhost:5000/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      const decodedUser = jwtDecode(token);
      // JWT utilise 'sub' pour l'ID utilisateur, nous le convertissons pour plus de commodité
      const user = {
        id: decodedUser.sub,
        role: decodedUser.role,
        iat: decodedUser.iat,
        exp: decodedUser.exp
      };
      console.log("Decoded user:", user);
      setUser(user);
      return user;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      
      if (error.response && error.response.data && error.response.data.redirect === 'blocked') {
        const blockedError = new Error("Account blocked");
        blockedError.isBlocked = true;
        throw blockedError;
      }
      
      const errorMessage = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message;
      throw new Error(errorMessage);
    }
  }

  async function signUp(email, password) {
    try {
      const response = await axios.post("http://localhost:5000/auth/register", { email, password });
      return response.data;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      const errorMessage = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message;
      throw new Error(errorMessage);
    }
  }

  function logOut() {
    setUser(null);
    localStorage.removeItem("token");
    setAuthenticatedRooms([]);
    localStorage.removeItem("authenticatedRooms");
  }

  function authenticateRoom(roomId) {
    setAuthenticatedRooms((prev) => {
      const updatedRooms = [...prev, roomId];
      localStorage.setItem("authenticatedRooms", JSON.stringify(updatedRooms));
      return updatedRooms;
    });
  }

  function isRoomAuthenticated(roomId) {
    return authenticatedRooms.includes(roomId);
  }

  return (
    <userAuthContext.Provider
      value={{ user, logIn, signUp, logOut, authenticateRoom, isRoomAuthenticated }}
    >
      {!loading && children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}