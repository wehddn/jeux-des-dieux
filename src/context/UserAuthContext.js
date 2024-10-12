import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticatedRooms, setAuthenticatedRooms] = useState(
    JSON.parse(localStorage.getItem("authenticatedRooms")) || []
  );

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    return credential;
  }

  function logOut() {
    setAuthenticatedRooms([]);
    localStorage.removeItem("authenticatedRooms");
    return signOut(auth);
  }

  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider
      value={{ user, logIn, signUp, logOut, googleSignIn, resetPassword, authenticateRoom, isRoomAuthenticated }}
    >
      {!loading && children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}