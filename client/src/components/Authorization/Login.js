import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../../context/UserAuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { logIn, user, loading } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/profile');
    }
  }, [user, navigate, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await logIn(email, password);
      navigate("/profile");
    } catch (err) {
      if (err.isBlocked) {
        // Redirect to blocked page for blocked users
        navigate("/blocked");
      } else {
        setError(err.message);
      }
    }
  };

  const handleNewPassword = () => {
    navigate("/signup");
  };

  return (
    <section className="p-4 d-flex justify-content-center align-items-center row">
      <img src={`/img/LOGO.svg`} alt="LOGO" />
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>MAIL</Form.Label>
          <Form.Control
            type="email"
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>MOT DE PASSE</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="d-flex justify-content-center align-items-center row">
          <Button variant="primary" type="Submit" className="button-custom">ENTRER</Button>
        </div>
      </Form>
      <div className="d-flex justify-content-center align-items-center row" style={{ padding: 0 }}>
        <Button variant="primary" className="button-custom" onClick={handleNewPassword}>S'INSCRIRE</Button>
      </div>
    </section>
  );
};

export default Login;