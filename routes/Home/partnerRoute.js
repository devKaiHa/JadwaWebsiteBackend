const express = require("express");
const authService = require("../../services/AuthService");

const {
  createPartner,
  deletePartner,
  getOnePartner,
  getPartners,
  getPublicPartners,
  resizePartnerImage,
  updatePartner,
  uploadPartnerImage,
} = require("../../services/Home/partnerService");

const partnerRouter = express.Router();

// Public
partnerRouter.get("/public", getPublicPartners);

// Admin / general
partnerRouter
  .route("/")
  .get(getPartners)
  .post(
    authService.protect,
    uploadPartnerImage,
    resizePartnerImage,
    createPartner,
  );

partnerRouter
  .route("/:id")
  .get(getOnePartner)
  .put(
    authService.protect,
    uploadPartnerImage,
    resizePartnerImage,
    updatePartner,
  )
  .delete(authService.protect, deletePartner);

module.exports = partnerRouter;
