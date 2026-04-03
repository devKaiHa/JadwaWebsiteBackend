const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const investmentFundsModel = require("../models/InvestmentFunds");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const safeParseJSON = (value, fieldName) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }
};

exports.uploadInvestmentFundImage = uploadSingleImage("image");

exports.resizeInvestmentFundImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `investment-fund-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/investmentFunds/${filename}`);

  req.body.image = filename;

  next();
});

// Admin list
exports.getInvestmentFunds = asyncHandler(async (req, res) => {
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
      { "content.ar": { $regex: safeKeyword, $options: "i" } },
      { "content.en": { $regex: safeKeyword, $options: "i" } },
      { "content.tr": { $regex: safeKeyword, $options: "i" } },
      { fundLink: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [funds, total] = await Promise.all([
    investmentFundsModel.find(query).sort(sort).skip(skip).limit(limitNum),
    investmentFundsModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      funds.length > 0
        ? "Investment funds fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: funds,
  });
});

// Public list
exports.getPublicInvestmentFunds = asyncHandler(async (req, res) => {
  const funds = await investmentFundsModel
    .find({ isActive: true })
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    status: true,
    data: funds,
  });
});

exports.createInvestmentFund = asyncHandler(async (req, res) => {
  req.body.title = safeParseJSON(req.body.title, "title");
  req.body.content = safeParseJSON(req.body.content, "content");

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const fund = await investmentFundsModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Investment fund created successfully",
    data: fund,
  });
});

exports.getOneInvestmentFund = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const fund = await investmentFundsModel.findById(id);

  if (!fund) {
    return next(
      new ApiError(`No Investment Fund found for this id ${id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: fund,
  });
});

exports.updateInvestmentFund = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.title !== undefined) {
    req.body.title = safeParseJSON(req.body.title, "title");
  }

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const updatedFund = await investmentFundsModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedFund) {
    return next(
      new ApiError(`No Investment Fund found for this id: ${id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    message: "Investment fund updated successfully",
    data: updatedFund,
  });
});

exports.deleteInvestmentFund = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const fund = await investmentFundsModel.findByIdAndDelete(id);

  if (!fund) {
    return next(
      new ApiError(`No Investment Fund found for this id ${id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    message: "Investment fund deleted successfully",
  });
});
