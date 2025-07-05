import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getGame } from "../../bd/Games";
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
        const gameData = await getGame(id);

        if (gameData) {
          if (gameData.creatorId === user.id) {
            authenticateRoom(id);
            setIsAuthorized(true);
          } else if (isRoomAuthenticated(id)) {
            setIsAuthorized(true);
          } else if (gameData.isPrivate) {
            setShowPasswordModal(true);
          } else {
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
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
    <main>
      {isAuthorized && children}
      {!isAuthorized && !loading && showPasswordModal && (
        <PasswordModal
          isOpen={showPasswordModal}
          onRequestClose={handlePasswordModalClose}
          room={ id }
          onPasswordCorrect={handlePasswordCorrect}
          aria-label="Password Required"
        />
      )}
      {!isAuthorized && !loading && !showPasswordModal && (
        <Navigate to="/" replace />
      )}
    </main>
  );
}

export default PrivateRoute;
