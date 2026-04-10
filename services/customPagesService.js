const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const CustomPageModel = require("../models/customPageModel");
const buildSlug = require("../utils/buildSlug");

// Admin list
exports.getCustomPages = asyncHandler(async (req, res) => {
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
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { slug: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [pages, total] = await Promise.all([
    CustomPageModel.find(query).sort(sort).skip(skip).limit(limitNum),
    CustomPageModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    data: pages,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

// Public list
exports.getPublicCustomPages = asyncHandler(async (req, res) => {
  const pages = await CustomPageModel.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({ status: true, data: pages });
});

// Get by slug (important)
exports.getCustomPageBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const page = await CustomPageModel.findOne({
    slug,
    isActive: true,
  });

  if (!page) {
    return next(new ApiError(`No page found for slug: ${slug}`, 404));
  }

  res.status(200).json({ status: true, data: page });
});

exports.getOneCustomPage = asyncHandler(async (req, res, next) => {
  const page = await CustomPageModel.findById(req.params.id);

  if (!page) {
    return next(new ApiError("Page not found", 404));
  }

  res.status(200).json({ status: true, data: page });
});

exports.createCustomPage = asyncHandler(async (req, res) => {
  req.body.slug = buildSlug(req.body.title);
  const page = await CustomPageModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Page created successfully",
    data: page,
  });
});

exports.updateCustomPage = asyncHandler(async (req, res, next) => {
  const page = await CustomPageModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!page) {
    return next(new ApiError("Page not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Page updated successfully",
    data: page,
  });
});

exports.deleteCustomPage = asyncHandler(async (req, res, next) => {
  const page = await CustomPageModel.findByIdAndDelete(req.params.id);

  if (!page) {
    return next(new ApiError("Page not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Page deleted successfully",
  });
});
