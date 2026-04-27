const express = require("express");
const authService = require("../services/AuthService");
const {
  getPageBanners,
  updatePageBanners,
  uploadPageBannerImages,
  resizePageBannerImages,
} = require("../services/pageBannerSerice");

const pageBannerRouter = express.Router();

pageBannerRouter.get("/public", getPageBanners);
pageBannerRouter
  .route("/")
  .get(getPageBanners)
  .put(
    authService.protect,
    uploadPageBannerImages,
    resizePageBannerImages,
    updatePageBanners,
  );

module.exports = pageBannerRouter;
