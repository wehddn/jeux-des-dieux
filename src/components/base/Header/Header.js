import React from "react";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../../context/UserAuthContext.js";
import { Button } from "react-bootstrap";

const Header = () => {
    const { logOut } = useUserAuth();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            await logOut();
            navigate("/");
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div>
            <Button variant="primary" onClick={handleLogout}>Log out</Button>
        </div>
    );
};

export default Header;