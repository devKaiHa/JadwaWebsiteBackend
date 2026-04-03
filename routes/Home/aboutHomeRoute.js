const express = require("express");
const authService = require("../../services/AuthService");

const {
  getAboutHome,
  updateAboutHome,
} = require("../../services/Home/aboutHomeService");

const aboutHomeRouter = express.Router();

aboutHomeRouter
  .route("/")
  .get(getAboutHome)
  .put(authService.protect, updateAboutHome);

module.exports = aboutHomeRouter;
