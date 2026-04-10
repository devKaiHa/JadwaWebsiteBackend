const express = require("express");
const authService = require("../services/AuthService");
const {
  getPolicies,
  getPublicPolicies,
  getPolicyBySlug,
  getOnePolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require("../services/policyService");

const policyRouter = express.Router();

policyRouter.get("/public", getPublicPolicies);
policyRouter.get("/public/slug/:slug", getPolicyBySlug);

policyRouter
  .route("/")
  .get(getPolicies)
  .post(authService.protect, createPolicy);

policyRouter
  .route("/:id")
  .get(getOnePolicy)
  .put(authService.protect, updatePolicy)
  .delete(authService.protect, deletePolicy);

module.exports = policyRouter;
