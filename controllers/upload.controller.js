const UserModel = require("../models/user.model");
const fs = require("fs").promises;
const path = require("path");
const multer = require('multer');
const { uploadErrors } = require("../utils/errors.utils");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500000,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
}).single('file');

module.exports.uploadProfil = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      throw new Error('No file received');
    }

    const fileName = req.file.originalname;
    const filePath = path.join(__dirname, "../client/public/uploads/profil", fileName);

    // Création du répertoire s'il n'existe pas
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    console.log("File received:", fileName);

    await fs.writeFile(filePath, req.file.buffer);

    console.log("File written to disk:", filePath);

    console.log("userID", req.body.userId);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set : { picture: "./uploads/profil/" + fileName }},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log("User updated:", updatedUser);

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error during upload:", err);
    const errors = uploadErrors(err);
    res.status(400).json({ errors });
  }
};
