const express = require("express");
const authService = require("../services/AuthService");
const {
  getCategories,
  getPublicCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getOneCategory,
} = require("../services/categoryService");

const categoryRouter = express.Router();

// Public
categoryRouter.get("/public", getPublicCategories);
categoryRouter.get("/public/slug/:slug", getCategoryBySlug);

// Admin / general
categoryRouter
  .route("/")
  .get(getCategories)
  .post(authService.protect, createCategory);

categoryRouter
  .route("/:id")
  .get(getOneCategory)
  .put(authService.protect, updateCategory)
  .delete(authService.protect, deleteCategory);

module.exports = categoryRouter;
