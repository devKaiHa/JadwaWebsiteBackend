const express = require("express");
const authService = require("../../services/AuthService");

const {
  getAboutServices,
  updateAboutServices,
} = require("../../services/Service/aboutService");

const aboutServiceRouter = express.Router();

aboutServiceRouter
  .route("/")
  .get(getAboutServices)
  .put(authService.protect, updateAboutServices);

module.exports = aboutServiceRouter;
