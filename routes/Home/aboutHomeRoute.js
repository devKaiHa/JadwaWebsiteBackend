const express = require("express");
const authService = require("../../services/AuthService");

const {
  getAboutHome,
  updateAboutHome,
  uploadAboutImages,
  resizeAboutImages,
} = require("../../services/Home/aboutHomeService");

const aboutHomeRouter = express.Router();

aboutHomeRouter
  .route("/")
  .get(getAboutHome)
  .put(
    authService.protect,
    uploadAboutImages,
    resizeAboutImages,
    updateAboutHome,
  );

module.exports = aboutHomeRouter;
