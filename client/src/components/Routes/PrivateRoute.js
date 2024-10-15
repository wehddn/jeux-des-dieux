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
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const roomRef = doc(db, "Games", id);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
          const roomData = roomDoc.data();
          if (roomData.creatorId === user.uid) {
            authenticateRoom(id);
            setIsAuthorized(true);
          } else if (isRoomAuthenticated(id)) {
            setIsAuthorized(true);
          } else if (roomData.isPrivate) {
            setShowPasswordModal(true);
          } else {
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [id, isRoomAuthenticated, user, authenticateRoom]);

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordCorrect = () => {
    setIsAuthorized(true);
    setShowPasswordModal(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isAuthorized && children}
      {!isAuthorized && !loading && showPasswordModal && (
        <PasswordModal
          isOpen={showPasswordModal}
          onRequestClose={handlePasswordModalClose}
          room={ id }
          onPasswordCorrect={handlePasswordCorrect}
        />
      )}
      {!isAuthorized && !loading && !showPasswordModal && (
        <Navigate to="/" replace />
      )}
    </>
  );
}

export default PrivateRoute;
