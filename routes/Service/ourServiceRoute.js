const express = require("express");
const authService = require("../../services/AuthService");

const {
  createOurService,
  deleteOurService,
  getOneOurService,
  getOurServices,
  getPublicOurServices,
  updateOurService,
} = require("../../services/Service/ourService");

const ourServiceRouter = express.Router();

// Public
ourServiceRouter.get("/public", getPublicOurServices);

// Admin
ourServiceRouter
  .route("/")
  .get(getOurServices)
  .post(authService.protect, createOurService);

ourServiceRouter
  .route("/:id")
  .get(getOneOurService)
  .put(authService.protect, updateOurService)
  .delete(authService.protect, deleteOurService);

module.exports = ourServiceRouter;
