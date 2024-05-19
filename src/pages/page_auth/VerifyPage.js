import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { Button } from "react-bootstrap";


const VerifyPage = () => {
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (user && user.emailVerified) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="p-4 box">
      <h2 className="mb-3">Vérifiez Votre Adresse E-Mail</h2>
      <p>
        Merci de vous être inscrit! Un e-mail a été envoyé à votre adresse e-mail. Veuillez suivre les instructions dans l'e-mail pour vérifier votre compte.
      </p>
      <p>
        Si vous n'avez pas reçu l'e-mail, veuillez vérifier votre dossier spam. Si vous avez besoin d'aide supplémentaire, veuillez <Link to="/contact">nous contacter</Link>.
      </p>
      <div className="d-flex justify-content-center align-items-center row">
        <Button variant="primary" className="button-custom" onClick={handleRefresh}>J'AI CONFIRMÉ MON EMAIL</Button>
        <Button variant="primary" className="button-custom" onClick={handleLogout}>DÉCONNECTER</Button>
      </div>
    </div>
  );
};

export default VerifyPage;
