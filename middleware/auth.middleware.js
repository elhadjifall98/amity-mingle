const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const verifyToken = async (token) => {
  try {
    const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET);
    return decodedToken;
  } catch (err) {
    return null;
  }
};

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  res.locals.user = null;

  if (token) {
    const decodedToken = await verifyToken(token);
    if (decodedToken) {
      res.locals.user = await UserModel.findById(decodedToken.id);
    }
  }

  next();
};

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    console.log('No token');
    return res.status(401).json('No token');
  }

  try {
    const decodedToken = await verifyToken(token);
    console.log(decodedToken.id);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json('Invalid token');
  }
};
