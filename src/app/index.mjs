import express, {json, urlencoded, Router} from 'express';
import subdomain from 'express-subdomain';
import session from 'express-session';
import http from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const {settings} = app;
let port = process.env.PORT ?? 8080;

const io = new Server(server, {
  cors: {
    origin: `*`, 
  },
});

app.use(json(), urlencoded({extended: false})); 
app.use(session({
    secret: process.env.AUTH_SECRET ?? `developer_testing`,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 3600 * 24 }
}))

app.get(`/`, (req, res) => {
  res.status(200).json({code: 200, message: `OK`});
});

const messaging_router = express.Router();
messaging_router.get(`/`, async (req, res) => {
  res.send(`Messaging test`)
})
app.use(subdomain('messaging', messaging_router))

io.on(`connection`, (socket) => {
  io.emit(`message`,`${socket.id} connected!`);

  socket.on(`message`, (data) => {
    console.log(`Message received:`, data);
    io.emit(`message`, `${socket.id}: ${data}`);
  });

  socket.on(`disconnect`, (reason) => {
    io.emit(`message`,`${socket.id} disconnected: ${reason}`);
  });
});

server.listen(8080, () => {
  console.log(`Server listening on http://localhost:8080`);
});