const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/errors.utils');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

const handleCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge,
    domain: '.herokuapp.com', // Utilisez le domaine de votre backend
    path: '/', // Assurez-vous que le chemin est correct pour votre application
  });
};



module.exports.signUp = async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;
    const user = await UserModel.create({ pseudo, email, password });
    const token = createToken(user._id);
    handleCookie(res, token);
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(200).send({ errors });
  }
};

module.exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    handleCookie(res, token);
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = signInErrors(err);
    res.status(200).json({ errors });
  }
};

module.exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};
