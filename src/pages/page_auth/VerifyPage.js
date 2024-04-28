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

  useEffect(() => {
    if (user && user.emailVerified) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="p-4 box">
      <h2 className="mb-3">Verify Your Email Address</h2>
      <p>
        Thank you for signing up! An email has been sent to your email address. Please follow the instructions in the email to verify your account.
      </p>
      <p>
        If you haven't received the email, please check your spam folder. If you need further assistance, please <Link to="/contact">contact us</Link>.
      </p>
      <div className="d-grid gap-2">

      <Button variant="primary" onClick={handleLogout}>
        Log out
      </Button>
      
      </div>
    </div>
  );
};

export default VerifyPage;
