const express = require("express");
const authService = require("../../services/AuthService");

const {
  createPlan,
  deletePlan,
  getOnePlan,
  getPlans,
  getPublicPlans,
  updatePlan,
} = require("../../services/Service/plans");

const plansRouter = express.Router();

// Public
plansRouter.get("/public", getPublicPlans);

// Admin
plansRouter.route("/").get(getPlans).post(authService.protect, createPlan);

plansRouter
  .route("/:id")
  .get(getOnePlan)
  .put(authService.protect, updatePlan)
  .delete(authService.protect, deletePlan);

module.exports = plansRouter;
