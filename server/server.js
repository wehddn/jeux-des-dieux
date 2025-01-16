const express = require('express');
const WebSocket = require('ws');
const { handleWebSocketConnection } = require('./controllers/gameController');

const app = express();
const port = 3001;

const server = app.listen(port, () => {});

const wss = new WebSocket.Server({ server });

console.log(`Server running on port ${port}`);

wss.on('connection', (ws) => {
  handleWebSocketConnection(ws, wss);
});
