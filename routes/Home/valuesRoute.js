const express = require("express");
const authService = require("../../services/AuthService");

const {
  createValue,
  deleteValue,
  getOneValue,
  getValues,
  getPublicValues,
  updateValue,
} = require("../../services/Home/valuesServices");

const valuesRouter = express.Router();

// Public
valuesRouter.get("/public", getPublicValues);

// Admin / general
valuesRouter.route("/").get(getValues).post(authService.protect, createValue);

valuesRouter
  .route("/:id")
  .get(getOneValue)
  .put(authService.protect, updateValue)
  .delete(authService.protect, deleteValue);

module.exports = valuesRouter;
