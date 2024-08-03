import React from "react";
import { useNavigate } from "react-router";
import Header from "../base/Header/Header.js";
import { Button } from "react-bootstrap";

const Games = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header></Header>
      <div>
        <h1>Games</h1>
        <Button variant="primary" onClick={() => navigate("/games/game")}>
          GAME
        </Button>
      </div>
    </>
  );
};

export default Games;
