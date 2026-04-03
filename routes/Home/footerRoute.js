const express = require("express");
const authService = require("../../services/AuthService");

const {
  getFooter,
  updateFooter,
} = require("../../services/Home/footerServices");

const footerRouter = express.Router();

footerRouter.route("/").get(getFooter).put(authService.protect, updateFooter);
module.exports = footerRouter;
