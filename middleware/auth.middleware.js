const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      let user = await UserModel.findById(decodedToken.id);
      res.locals.user = user;
    } catch (err) {
      res.locals.user = null;
      res.cookie("jwt", "", { maxAge: 1 }); // Décommenter si vous souhaitez déconnecter l'utilisateur en cas d'erreur
    }
  } else {
    res.locals.user = null;
  }
  next();
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      console.log(decodedToken.id);
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Unauthorized' });
      // Vous pouvez également appeler next(err) ici si vous avez un gestionnaire d'erreurs global
    }
  } else {
    console.log('No token');
    res.status(401).json({ message: 'Unauthorized' });
    // Vous pouvez également appeler next(new Error('No token')) ici si vous avez un gestionnaire d'erreurs global
  }
};
