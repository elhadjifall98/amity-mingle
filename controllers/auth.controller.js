const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
// const bcrypt = require('bcrypt');

const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge
  });
};

module.exports.signUp = async (req, res) => {
  const {pseudo, email, password} = req.body

  try {
    const user = await UserModel.create({pseudo, email, password });
    res.status(201).json({ user: user._id});
  }
  catch(err) {
    const errors = signUpErrors(err);
    res.status(200).send({ errors })
  }
}

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    
    // Utilisez le domaine spécifié dans le fichier .env
    const clientUrl = process.env.CLIENT_URL;
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge, domain: clientUrl });

    res.status(200).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ errors: err.message });
  }
};

module.exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};
