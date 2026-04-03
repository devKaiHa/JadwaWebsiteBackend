const express = require("express");
const authService = require("../services/AuthService");

const {
  getUsers,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../services/userService");

const userRouter = express.Router();

userRouter
  .route("/")
  .get(authService.protect, getUsers)
  .post(authService.protect, createUser);

userRouter
  .route("/:id")
  .get(authService.protect, getOneUser)
  .put(authService.protect, updateUser)
  .delete(authService.protect, deleteUser);

module.exports = userRouter;
