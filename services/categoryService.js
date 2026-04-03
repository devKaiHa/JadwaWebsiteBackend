const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const categoryModel = require("../models/categoryModel");
const { default: slugify } = require("slugify");

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
exports.getCategories = asyncHandler(async (req, res) => {
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
      { slug: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [categories, total] = await Promise.all([
    categoryModel.find(query).sort(sort).skip(skip).limit(limitNum),
    categoryModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      categories.length > 0
        ? "Categories fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: categories,
  });
});

// Public list
exports.getPublicCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel
    .find({ isActive: true })
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    status: true,
    data: categories,
  });
});

exports.createCategory = asyncHandler(async (req, res) => {
  req.body.name = safeParseJSON(req.body.name, "name");
  req.body.slug = buildSlug(req.body.name);

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const category = await categoryModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Category created successfully",
    data: category,
  });
});

exports.getOneCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await categoryModel.findById(id);

  if (!category) {
    return next(new ApiError(`No Category found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: category,
  });
});

exports.getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const category = await categoryModel.findOne({ slug, isActive: true });

  if (!category) {
    return next(
      new ApiError(`No active Category found for slug: ${slug}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.name !== undefined) {
    req.body.name = safeParseJSON(req.body.name, "name");
    req.body.slug = buildSlug(req.body.name);
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const updatedCategory = await categoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedCategory) {
    return next(new ApiError(`No Category found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await categoryModel.findByIdAndDelete(id);

  if (!category) {
    return next(new ApiError(`No Category found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Category deleted successfully",
  });
});
