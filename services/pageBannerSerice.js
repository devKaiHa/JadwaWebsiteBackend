const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const ApiError = require("../utils/apiError");
const { uploadMixOfImages } = require("../middlewares/uploadingImage");
const PageBannerModel = require("../models/pageBannerModel");

const PAGE_KEYS = [
  "about",
  "investments",
  "analytics_research",
  "blogs",
  "careers",
  "contact",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const BACKEND_ROOT = path.join(__dirname, "..");
const PAGE_BANNER_UPLOAD_DIR = path.join(
  BACKEND_ROOT,
  "uploads",
  "page-banners",
);

const removeStoredFile = async (relativePath = "") => {
  if (!relativePath) return;

  const absolutePath = path.join(BACKEND_ROOT, "uploads", relativePath);

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to remove file ${absolutePath}`, error);
    }
  }
};

exports.uploadPageBannerImages = uploadMixOfImages(
  PAGE_KEYS.map((name) => ({ name, maxCount: 1 })),
);

exports.resizePageBannerImages = asyncHandler(async (req, res, next) => {
  if (!req.files || !Object.keys(req.files).length) return next();

  await fs.promises.mkdir(PAGE_BANNER_UPLOAD_DIR, { recursive: true });

  const uploadedPaths = {};

  for (const pageKey of PAGE_KEYS) {
    const file = req.files?.[pageKey]?.[0];

    if (!file) continue;

    if (file.size > MAX_FILE_SIZE) {
      return next(new ApiError(`${pageKey} image must be 2MB or smaller`, 400));
    }

    const filename = `${pageKey}-${uuidv4()}-${Date.now()}.webp`;

    await sharp(file.buffer)
      .resize(1800, 900, { fit: "cover" })
      .toFormat("webp")
      .webp({ quality: 80 })
      .toFile(path.join(PAGE_BANNER_UPLOAD_DIR, filename));

    uploadedPaths[pageKey] = `page-banners/${filename}`;
  }

  req.body.processedImages = uploadedPaths;
  next();
});

exports.getPageBanners = asyncHandler(async (req, res) => {
  let pageBanners = await PageBannerModel.findOne({});

  if (!pageBanners) {
    pageBanners = await PageBannerModel.create({});
  }

  res.status(200).json({
    status: true,
    data: pageBanners,
  });
});

exports.updatePageBanners = asyncHandler(async (req, res) => {
  const processedImages = req.body.processedImages || {};
  const currentPageBanners = await PageBannerModel.findOne({});

  const updatedPageBanners = await PageBannerModel.findOneAndUpdate(
    {},
    processedImages,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  await Promise.all(
    PAGE_KEYS.map(async (pageKey) => {
      if (!processedImages[pageKey]) return;

      const previousPath = currentPageBanners?.[pageKey];
      if (previousPath && previousPath !== processedImages[pageKey]) {
        await removeStoredFile(previousPath);
      }
    }),
  );

  res.status(200).json({
    status: true,
    message: "Page banners saved successfully",
    data: updatedPageBanners,
  });
});
