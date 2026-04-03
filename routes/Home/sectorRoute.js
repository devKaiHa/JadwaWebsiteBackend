const express = require("express");
const authService = require("../../services/AuthService");

const {
  createSector,
  deleteSector,
  getOneSector,
  getSectors,
  getPublicSectors,
  updateSector,
  uploadSectorsImages,
  resizeSectorsImages,
} = require("../../services/Home/serctorService");

const sectorRouter = express.Router();

// Public
sectorRouter.get("/public", getPublicSectors);

// Admin / general
sectorRouter
  .route("/")
  .get(getSectors)
  .post(
    authService.protect,
    uploadSectorsImages,
    resizeSectorsImages,
    createSector,
  );

sectorRouter
  .route("/:id")
  .get(getOneSector)
  .put(
    authService.protect,
    uploadSectorsImages,
    resizeSectorsImages,
    updateSector,
  )
  .delete(authService.protect, deleteSector);

module.exports = sectorRouter;
