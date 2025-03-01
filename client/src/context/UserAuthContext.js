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

  // При инициализации проверяем наличие токена в localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Ошибка декодирования токена:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Функция логина через API
  async function logIn(email, password) {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      const decodedUser = jwtDecode(token);
      console.log("Decoded user:", decodedUser);
      setUser(decodedUser);
      return decodedUser;
    } catch (error) {
      console.error("Ошибка логина:", error);
      throw error;
    }
  }

  // Функция регистрации через API
  async function signUp(email, password) {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", { email, password });
      return response.data;
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      const errorMessage = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message;
      throw new Error(errorMessage);
    }
  }

  // Функция разлогинивания
  function logOut() {
    setUser(null);
    localStorage.removeItem("token");
    setAuthenticatedRooms([]);
    localStorage.removeItem("authenticatedRooms");
  }

  // Логика для аутентификации игровых комнат (без изменений)
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