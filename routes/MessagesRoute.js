const express = require("express");
const authService = require("../services/AuthService");

const {
  getMessages,
  createMessage,
  getOneMessage,
  replyToMessage,
  deleteMessage,
} = require("../services/MessagesService");

const messagesRouter = express.Router();

// Public
messagesRouter.route("/").post(createMessage);

// Admin
messagesRouter.route("/").get(authService.protect, getMessages);

messagesRouter
  .route("/:id")
  .get(authService.protect, getOneMessage)
  .delete(authService.protect, deleteMessage);

messagesRouter.put("/:id/reply", authService.protect, replyToMessage);

module.exports = messagesRouter;
