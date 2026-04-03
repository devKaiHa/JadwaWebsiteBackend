const express = require("express");
const router = express.Router();

const {
  getSliders,
  getPublicSliders,
  getOneSlider,
  createSlider,
  updateSlider,
  deleteSlider,
  updateSliderBulk,
  uploadSliderImages,
  resizeSliderImages,
} = require("../../services/Home/homeSliderService");

// Public
router.get("/public/list", getPublicSliders);

// Admin
// Bulk edit
router.put("/bulk/update", updateSliderBulk);
router.get("/", getSliders);
router.get("/:id", getOneSlider);
router.post("/", uploadSliderImages, resizeSliderImages, createSlider);
router.put("/:id", uploadSliderImages, resizeSliderImages, updateSlider);
router.delete("/:id", deleteSlider);

module.exports = router;
