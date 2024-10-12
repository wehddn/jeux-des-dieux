import React, { useState } from "react";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../../context/UserAuthContext";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { resetPassword } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await resetPassword(email);
      setMessage("Veuillez vérifier votre courriel pour les instructions supplémentaires concernant la récupération du mot de passe.");
    } catch (err) {
      setError(err.message);
    }
  };

  const goToLogin = () => {
    navigate("/");
  };

  return (
    <div className="p-4 box">
      <h2 className="mb-3">Récupération de mot de passe</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
            type="email"
            placeholder="Entrez votre adresse e-mail"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <div className="d-flex justify-content-center align-items-center row">
          <Button variant="primary" type="Submit" className="button-custom">
            ENVOYER LES INSTRUCTIONS
          </Button>
        </div>
      </Form>
      <div className="d-flex justify-content-center align-items-center row mt-3">
        <Button variant="secondary" className="button-custom" onClick={goToLogin}>
            RETOUR À LA CONNEXION
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
