const express = require('express');
const WebSocket = require('ws');
const { handleWebSocketConnection } = require('./webSocketHandlers');

const app = express();
const port = 3001;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  handleWebSocketConnection(ws, wss);
});
