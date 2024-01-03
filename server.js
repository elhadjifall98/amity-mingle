const express = require('express');
const bodyParser = require('body-parser');
// const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
require('dotenv').config({path: './config/.env'});
require('./config/db');
const {checkUser, requireAuth} = require('./middleware/auth.middleware');
const cors = require('cors');


const app = express();
app.use(cookieParser());


const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  'allowedHeaders': ['sessionId', 'Content-Type'],
  'exposedHeaders': ['sessionId'],
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false,
  'sameSite': 'None', // Vous pouvez ajuster en fonction de vos besoins
};

// Utilisez corsOptions dans votre middleware CORS
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// jwt
app.all('*', checkUser);
app.get('/jwtid', requireAuth, (req, res) => res.status(200).send(res.locals.user._id));


// routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// wss.on('connection', (ws) => {
//   console.log('WebSocket connection established');

//   // Gérer les messages reçus
//   ws.on('message', (message) => {
//     console.log(`Received message: ${message}`);

//     // Vous pouvez gérer les messages ici et envoyer des réponses, etc.
//   });

//   // Envoyer un message au client
//   ws.send('Hello, WebSocket client!');
// });

// server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
})