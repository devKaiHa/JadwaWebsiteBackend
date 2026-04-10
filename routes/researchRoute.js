const express = require("express");
const researchRouter = express.Router();
const authService = require("../services/AuthService");

const {
  getResearch,
  getPublicResearch,
  getResearchBySlug,
  createResearch,
  getOneResearch,
  updateResearch,
  deleteResearch,
  uploadResearchImage,
  resizeResearchImage,
} = require("../services/researchService");

// Public
researchRouter.get("/public", getPublicResearch);
researchRouter.get("/slug/:slug", getResearchBySlug);

// Admin
researchRouter
  .route("/")
  .get(authService.protect, getResearch)
  .post(
    authService.protect,
    uploadResearchImage,
    resizeResearchImage,
    createResearch,
  );
researchRouter
  .route("/:id")
  .get(authService.protect, getOneResearch)
  .put(
    authService.protect,
    uploadResearchImage,
    resizeResearchImage,
    updateResearch,
  )
  .delete(authService.protect, deleteResearch);

module.exports = researchRouter;
