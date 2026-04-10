const express = require("express");
const authService = require("../services/AuthService");
const {
  getContact,
  updateContact,
} = require("../services/contactUsService");

const contactUsRouter = express.Router();

contactUsRouter.get("/public", getContact);
contactUsRouter
  .route("/")
  .get(getContact)
  .put(authService.protect, updateContact);

module.exports = contactUsRouter;
