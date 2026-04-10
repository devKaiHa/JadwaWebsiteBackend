const express = require("express");
const customPageRouter = express.Router();

const {
  getCustomPages,
  getPublicCustomPages,
  getCustomPageBySlug,
  getOneCustomPage,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
} = require("../services/customPagesService");

// Public
customPageRouter.get("/public", getPublicCustomPages);
customPageRouter.get("/slug/:slug", getCustomPageBySlug);

// Admin
customPageRouter.get("/", getCustomPages);
customPageRouter.get("/:id", getOneCustomPage);
customPageRouter.post("/", createCustomPage);
customPageRouter.put("/:id", updateCustomPage);
customPageRouter.delete("/:id", deleteCustomPage);

module.exports = customPageRouter;
