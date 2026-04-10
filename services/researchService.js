const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ResearchModel = require("../models/researchModel");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const buildSlug = require("../utils/buildSlug");
const safeParseJSON = require("../utils/safeParseJson");

exports.uploadResearchImage = uploadSingleImage("image");

exports.resizeResearchImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `research-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/research/${filename}`);

  req.body.image = filename;

  next();
});

// Admin list
exports.getResearch = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    isActive,
    isPublished,
  } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (isPublished !== undefined) {
    query.isPublished = isPublished === "true";
  }

  if (keyword && keyword.trim() !== "") {
    query.$or = [
      { "title.ar": { $regex: keyword, $options: "i" } },
      { "title.en": { $regex: keyword, $options: "i" } },
      { "title.tr": { $regex: keyword, $options: "i" } },
      { slug: { $regex: keyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [research, total] = await Promise.all([
    ResearchModel.find(query).sort(sort).skip(skip).limit(limitNum),
    ResearchModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    data: research,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

// Public list
exports.getPublicResearch = asyncHandler(async (req, res) => {
  const research = await ResearchModel.find({
    isActive: true,
    isPublished: true,
  }).sort({ order: 1, createdAt: -1 });

  res.status(200).json({ status: true, data: research });
});

exports.getResearchBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const item = await ResearchModel.findOne({
    slug,
    isActive: true,
    isPublished: true,
  });

  if (!item) {
    return next(new ApiError("Research not found", 404));
  }

  res.status(200).json({ status: true, data: item });
});

exports.createResearch = asyncHandler(async (req, res) => {
  req.body.slug = buildSlug(req.body.title);
  req.body.content = safeParseJSON(req.body.content, "content");
  req.body.title = safeParseJSON(req.body.title, "title");
  const item = await ResearchModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Research created successfully",
    data: item,
  });
});

exports.getOneResearch = asyncHandler(async (req, res, next) => {
  const item = await ResearchModel.findById(req.params.id);

  if (!item) {
    return next(new ApiError("Research not found", 404));
  }

  res.status(200).json({ status: true, data: item });
});

exports.updateResearch = asyncHandler(async (req, res, next) => {
  req.body.content = safeParseJSON(req.body.content, "content");
  if (req.body.title) {
    req.body.title = safeParseJSON(req.body.title, "title");
    req.body.slug = buildSlug(req.body.title);
  }
  const item = await ResearchModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    return next(new ApiError("Research not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Research updated successfully",
    data: item,
  });
});

exports.deleteResearch = asyncHandler(async (req, res, next) => {
  const item = await ResearchModel.findByIdAndDelete(req.params.id);

  if (!item) {
    return next(new ApiError("Research not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Research deleted successfully",
  });
});
