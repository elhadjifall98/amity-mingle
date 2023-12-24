const express = require('express');
const http = require('http');
const webSocket = require ('ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
require('dotenv').config({path: './config/.env'});
require('./config/db');
const {checkUser, requireAuth} = require('./middleware/auth.middleware');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://quiet-oasis-36311-7ecc0ef1ffe1.herokuapp.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  // ...
  next();
});

wss.on('connection', (ws, req) => {
  // Récupérer le token depuis le cookie
  const token = req.cookies.jwt;

  // Faire quelque chose avec le token (par exemple, vérifier l'authentification)
  if (token) {
    // Authentification réussie, gérer la connexion WebSocket
    console.log('WebSocket connected with token:', token);
  } else {
    // Authentification échouée, fermer la connexion WebSocket
    console.log('WebSocket connection without token. Closing connection.');
    ws.close();
  }

  // Gérer les messages, etc.
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  // Gérer la fermeture de la connexion
  ws.on('close', () => {
    console.log('WebSocket closed');
  });
});

// jwt
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id)
});

// routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

// server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
})