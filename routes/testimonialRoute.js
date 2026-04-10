const express = require("express");
const authService = require("../services/AuthService");
const {
  getTestimonials,
  getPublicTestimonials,
  getOneTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialImage,
  resizeTestimonialImage,
} = require("../services/testimonialService");

const testimonialRouter = express.Router();

testimonialRouter.get("/public", getPublicTestimonials);

testimonialRouter
  .route("/")
  .get(getTestimonials)
  .post(
    authService.protect,
    uploadTestimonialImage,
    resizeTestimonialImage,
    createTestimonial,
  );

testimonialRouter
  .route("/:id")
  .get(getOneTestimonial)
  .put(
    authService.protect,
    uploadTestimonialImage,
    resizeTestimonialImage,
    updateTestimonial,
  )
  .delete(authService.protect, deleteTestimonial);

module.exports = testimonialRouter;
