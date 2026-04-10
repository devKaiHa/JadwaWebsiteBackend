const express = require("express");
const authService = require("../services/AuthService");

const {
  getProjects,
  getPublicProjects,
  getProjectBySlug,
  createProject,
  getOneProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  resizeProjectImage,
} = require("../services/projectsService");

const projectsRouter = express.Router();

projectsRouter.get("/public", getPublicProjects);
projectsRouter.get("/public/slug/:slug", getProjectBySlug);

projectsRouter
  .route("/")
  .get(getProjects)
  .post(
    authService.protect,
    uploadProjectImage,
    resizeProjectImage,
    createProject,
  );

projectsRouter
  .route("/:id")
  .get(getOneProject)
  .put(
    authService.protect,
    uploadProjectImage,
    resizeProjectImage,
    updateProject,
  )
  .delete(authService.protect, deleteProject);

module.exports = projectsRouter;
