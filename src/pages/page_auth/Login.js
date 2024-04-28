import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    console.log("try to redirect");
    if (!loading && user) {
      console.log("user here");
      navigate('/home');
    }
  }, [user, navigate, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await logIn(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate("/home");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="p-4 d-flex justify-content-center align-items-center row">

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
        
          <h2 className="mb-3">MAIL</h2>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          
          <h2 className="mb-3">MOT DE PASSE</h2>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="Submit" className="button-custom">ENTRER</Button>
          </div>
        </Form>
        <div className="d-grid gap-2">
          <Button variant="primary" className="button-custom" onClick={handleGoogleSignIn}>ENTRER AVEC GOOGLE</Button>
        </div>
      </div>
      <div className="d-grid gap-2">
          <Link to="/signup" variant="primary" className="button-custom">S'INSCRIRE</Link>
      </div>
    </>
  );
};

export default Login;