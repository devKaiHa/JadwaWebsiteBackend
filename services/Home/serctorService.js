const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const SectorModel = require("../../models/Home/sectorModel");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { uploadMixOfImages } = require("../../middlewares/uploadingImage");

exports.uploadSectorsImages = uploadMixOfImages([
  { name: "image", maxCount: 1 },
]);

exports.resizeSectorsImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.image && req.files.image[0]) {
    const sectorFilename = `sector-${uuidv4()}-${Date.now()}.webp`;

    await sharp(req.files.image[0].buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/sectors/${sectorFilename}`);

    req.body.image = sectorFilename;
  }

  next();
});

const safeParseJSON = (value, fieldName) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }
};

const buildSlug = (name = {}) => {
  const base = name?.en || name?.ar || name?.tr || "";
  return slugify(base, { lower: true, strict: true, trim: true });
};

// Admin list
exports.getSectors = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    isActive,
  } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (keyword && keyword.trim() !== "") {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "name.ar": { $regex: safeKeyword, $options: "i" } },
      { "name.en": { $regex: safeKeyword, $options: "i" } },
      { "name.tr": { $regex: safeKeyword, $options: "i" } },
      { "content.ar": { $regex: safeKeyword, $options: "i" } },
      { "content.en": { $regex: safeKeyword, $options: "i" } },
      { "content.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [sectors, total] = await Promise.all([
    SectorModel.find(query).sort(sort).skip(skip).limit(limitNum),
    SectorModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      sectors.length > 0
        ? "Sectors fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: sectors,
  });
});

// Public list
exports.getPublicSectors = asyncHandler(async (req, res) => {
  const sectors = await SectorModel.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: sectors,
  });
});

exports.createSector = asyncHandler(async (req, res) => {
  req.body.name = safeParseJSON(req.body.name, "name");
  req.body.content = safeParseJSON(req.body.content, "content");
  req.body.description = safeParseJSON(req.body.description, "description");
  req.body.slug = buildSlug(req.body.name);

  const sector = await SectorModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Sector created successfully",
    data: sector,
  });
});

exports.getOneSector = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const sector = await SectorModel.findById(id);

  if (!sector) {
    return next(new ApiError(`No Sector found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: sector,
  });
});

exports.updateSector = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  req.body.name = safeParseJSON(req.body.name, "name");
  req.body.content = safeParseJSON(req.body.content, "content");
  req.body.description = safeParseJSON(req.body.description, "description");
  if (req.body.name) {
    req.body.slug = buildSlug(req.body.name);
  }

  const updatedSector = await SectorModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedSector) {
    return next(new ApiError(`No Sector found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Sector updated successfully",
    data: updatedSector,
  });
});

exports.deleteSector = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const sector = await SectorModel.findByIdAndDelete(id);

  if (!sector) {
    return next(new ApiError(`No Sector found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Sector deleted successfully",
  });
});
