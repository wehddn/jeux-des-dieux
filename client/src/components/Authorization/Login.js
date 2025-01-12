import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../../context/UserAuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { logIn, googleSignIn, user, loading } = useUserAuth();
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
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate("/profile");
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleForgotPassword = () => {
    navigate("/signup");
  };

  const handleNewPassword = () => {
    navigate("/forgot-password");
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
        <Button variant="primary" className="button-custom" onClick={handleGoogleSignIn}>SE CONNECTER AVEC GOOGLE</Button>
        <Button variant="primary" className="button-custom" onClick={handleForgotPassword}>S'INSCRIRE</Button>
        <Button variant="primary" className="button-custom" onClick={handleNewPassword}>MOT DE PASS OUBLIÉ</Button>
      </div>
    </section>
  );
};

export default Login;