const express = require("express");
const authService = require("../services/AuthService");

const {
  uploadBlogImages,
  resizeBlogImages,
  getBlogs,
  getPublicBlogs,
  createBlog,
  getOneBlog,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogsByCategory,
} = require("../services/blogService");

const blogRouter = express.Router();

// Public
blogRouter.get("/public", getPublicBlogs);
blogRouter.get("/public/slug/:slug", getBlogBySlug);
blogRouter.get("/public/category/:slug", getBlogsByCategory);

// Admin / general
blogRouter
  .route("/")
  .get(getBlogs)
  .post(authService.protect, uploadBlogImages, resizeBlogImages, createBlog);

blogRouter
  .route("/:id")
  .get(getOneBlog)
  .put(authService.protect, uploadBlogImages, resizeBlogImages, updateBlog)
  .delete(authService.protect, deleteBlog);

module.exports = blogRouter;
