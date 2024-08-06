import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useUserAuth } from "../../context/UserAuthContext";
import PasswordModal from "../Games/PasswordModal";

function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { id } = useParams();
  const { isRoomAuthenticated, user, authenticateRoom } = useUserAuth();

  useEffect(() => {
    const checkAuthorization = async () => {
      console.log("Checking authorization for room ID:", id);
      if (!id) {
        console.log("No room ID provided");
        setLoading(false);
        return;
      }

      try {
        const roomRef = doc(db, "Games", id);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
          const roomData = roomDoc.data();
          console.log("Room data in PrivateRoute:", roomData);
          if (roomData.creatorId === user.uid) {
            console.log("User is the creator of the room, authenticating");
            authenticateRoom(id);
            setIsAuthorized(true);
          } else if (isRoomAuthenticated(id)) {
            console.log("User is authenticated for this room");
            setIsAuthorized(true);
          } else if (roomData.isPrivate) {
            console.log("Room is private, opening password modal");
            setShowPasswordModal(true);
          } else {
            console.log("Room is public, authorizing user");
            setIsAuthorized(true); // Установить true для публичных комнат
          }
        } else {
          console.log("Room does not exist");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error);
        setIsAuthorized(false);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [id, isRoomAuthenticated, user, authenticateRoom]);

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordCorrect = () => {
    console.log("Пароль введен корректно");
    setIsAuthorized(true);
    setShowPasswordModal(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  console.log("PrivateRoute", id);

  return (
    <>
      {isAuthorized && children}
      {!isAuthorized && !loading && showPasswordModal && (
        <PasswordModal
          isOpen={showPasswordModal}
          onRequestClose={handlePasswordModalClose}
          room={{ id }}
          onPasswordCorrect={handlePasswordCorrect} // Передача функции
        />
      )}
      {!isAuthorized && !loading && !showPasswordModal && (
        <Navigate to="/" replace />
      )}
    </>
  );
}

export default PrivateRoute;
