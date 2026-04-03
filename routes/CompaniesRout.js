const express = require("express");
const authService = require("../services/AuthService");

const {
  createCompany,
  deleteCompany,
  getCompanies,
  getPublicCompanies,
  getOneCompany,
  resizeCompaniesImages,
  uploadCompaniesImages,
  updateCompany,
} = require("../services/companiesService");

const companiesRouter = express.Router();

// Public
companiesRouter.get("/public", getPublicCompanies);

// Admin / general
companiesRouter
  .route("/")
  .get(getCompanies)
  .post(
    authService.protect,
    uploadCompaniesImages,
    resizeCompaniesImages,
    createCompany,
  );

companiesRouter
  .route("/:id")
  .get(getOneCompany)
  .put(
    authService.protect,
    uploadCompaniesImages,
    resizeCompaniesImages,
    updateCompany,
  )
  .delete(authService.protect, deleteCompany);

module.exports = companiesRouter;
