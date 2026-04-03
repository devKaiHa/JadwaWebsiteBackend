const express = require("express");
const authService = require("../services/AuthService");

const {
  createInvestmentFund,
  deleteInvestmentFund,
  getInvestmentFunds,
  getPublicInvestmentFunds,
  getOneInvestmentFund,
  resizeInvestmentFundImage,
  updateInvestmentFund,
  uploadInvestmentFundImage,
} = require("../services/investmentFunds");

const investmentFundsRouter = express.Router();

// Public
investmentFundsRouter.get("/public", getPublicInvestmentFunds);

// Admin / general
investmentFundsRouter
  .route("/")
  .get(getInvestmentFunds)
  .post(
    authService.protect,
    uploadInvestmentFundImage,
    resizeInvestmentFundImage,
    createInvestmentFund,
  );

investmentFundsRouter
  .route("/:id")
  .get(getOneInvestmentFund)
  .put(
    authService.protect,
    uploadInvestmentFundImage,
    resizeInvestmentFundImage,
    updateInvestmentFund,
  )
  .delete(authService.protect, deleteInvestmentFund);

module.exports = investmentFundsRouter;
