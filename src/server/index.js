const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = 3001; //API port

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

// WebSocket connection
let gameState = { counter: 0 };

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.send(JSON.stringify(gameState));

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);

    gameState.counter += 1;

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(gameState));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});