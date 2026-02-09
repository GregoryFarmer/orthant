import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `*`, 
  },
});

app.get(`/`, (req, res) => {
  res.status(200).json({code: 200, message: `OK`});
});

io.on(`connection`, (socket) => {
  console.log(`${socket.id} connected!`);

  socket.on(`message`, (data) => {
    console.log(`Message received:`, data);
    socket.emit(`message`, `Echo: ${data}`);
  });

  socket.on(`disconnect`, (reason) => {
    console.log(`${socket.id} disconnected:`, reason);
  });
});

server.listen(8080, () => {
  console.log(`Server listening on http://localhost:8080`);
});