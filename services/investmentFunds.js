const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const investmentFundsModel = require("../models/InvestmentFunds");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const buildSlug = require("../utils/buildSlug");
const safeParseJSON = require("../utils/safeParseJson");

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

exports.getInvestmentFunds = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    isActive,
    isFeatured,
  } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === "true";
  }

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { "content.ar": { $regex: safeKeyword, $options: "i" } },
      { "content.en": { $regex: safeKeyword, $options: "i" } },
      { "content.tr": { $regex: safeKeyword, $options: "i" } },
      { "shortAbout.ar": { $regex: safeKeyword, $options: "i" } },
      { "shortAbout.en": { $regex: safeKeyword, $options: "i" } },
      { "shortAbout.tr": { $regex: safeKeyword, $options: "i" } },
      { fundLink: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [funds, total] = await Promise.all([
    investmentFundsModel
      .find(query)
      .populate("companiesAssociated", "name _id logo slug")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
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

exports.getPublicInvestmentFunds = asyncHandler(async (req, res) => {
  const { keyword, sector, type, isFeatured, page = 1, limit } = req.query;
  const query = { isActive: true };

  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === "true";
  }

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();
    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { "shortAbout.ar": { $regex: safeKeyword, $options: "i" } },
      { "shortAbout.en": { $regex: safeKeyword, $options: "i" } },
      { "shortAbout.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  if (sector?.trim()) {
    const safeSector = sector.trim();
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { "targetingSectors.ar": { $regex: safeSector, $options: "i" } },
        { "targetingSectors.en": { $regex: safeSector, $options: "i" } },
        { "targetingSectors.tr": { $regex: safeSector, $options: "i" } },
      ],
    });
  }

  if (type?.trim()) {
    const safeType = type.trim();
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { "type.ar": { $regex: safeType, $options: "i" } },
        { "type.en": { $regex: safeType, $options: "i" } },
        { "type.tr": { $regex: safeType, $options: "i" } },
      ],
    });
  }

  const pageNum = parseInt(page, 10);
  const limitNum = limit ? parseInt(limit, 10) : null;
  const skip = limitNum ? (pageNum - 1) * limitNum : 0;

  let fundsQuery = investmentFundsModel
    .find(query)
    .populate("companiesAssociated", "name _id logo slug")
    .sort({ isFeatured: -1, order: 1, createdAt: -1 });

  if (limitNum) {
    fundsQuery = fundsQuery.skip(skip).limit(limitNum);
  }

  const funds = await fundsQuery;
  const response = { status: true, data: funds };

  if (limitNum) {
    const total = await investmentFundsModel.countDocuments(query);
    response.pagination = {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    };
  }

  res.status(200).json(response);
});

exports.getInvestmentFundBySlug = asyncHandler(async (req, res, next) => {
  const fund = await investmentFundsModel
    .findOne({ slug: req.params.slug, isActive: true })
    .populate("companiesAssociated", "name _id logo slug");

  if (!fund) {
    return next(
      new ApiError(
        `No Investment Fund found for slug ${req.params.slug}`,
        404,
      ),
    );
  }

  res.status(200).json({
    status: true,
    data: fund,
  });
});

exports.createInvestmentFund = asyncHandler(async (req, res) => {
  req.body.title = safeParseJSON(req.body.title, "title");
  req.body.content = safeParseJSON(req.body.content, "content");
  req.body.shortAbout = safeParseJSON(req.body.shortAbout, "shortAbout");
  req.body.type = safeParseJSON(req.body.type, "type");
  req.body.targetingSectors = safeParseJSON(
    req.body.targetingSectors,
    "targetingSectors",
  );
  req.body.slug = buildSlug(req.body.title);

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.isFeatured !== undefined) {
    req.body.isFeatured =
      req.body.isFeatured === true || req.body.isFeatured === "true";
  }

  const fund = await investmentFundsModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Investment fund created successfully",
    data: fund,
  });
});

exports.getOneInvestmentFund = asyncHandler(async (req, res, next) => {
  const fund = await investmentFundsModel
    .findById(req.params.id)
    .populate("companiesAssociated", "name _id logo slug");

  if (!fund) {
    return next(
      new ApiError(`No Investment Fund found for this id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: fund,
  });
});

exports.updateInvestmentFund = asyncHandler(async (req, res, next) => {
  if (req.body.title !== undefined) {
    req.body.title = safeParseJSON(req.body.title, "title");
    req.body.slug = buildSlug(req.body.title);
  }

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.shortAbout !== undefined) {
    req.body.shortAbout = safeParseJSON(req.body.shortAbout, "shortAbout");
  }

  if (req.body.type !== undefined) {
    req.body.type = safeParseJSON(req.body.type, "type");
  }

  if (req.body.targetingSectors !== undefined) {
    req.body.targetingSectors = safeParseJSON(
      req.body.targetingSectors,
      "targetingSectors",
    );
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.isFeatured !== undefined) {
    req.body.isFeatured =
      req.body.isFeatured === true || req.body.isFeatured === "true";
  }

  const updatedFund = await investmentFundsModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedFund) {
    return next(
      new ApiError(
        `No Investment Fund found for this id: ${req.params.id}`,
        404,
      ),
    );
  }

  res.status(200).json({
    status: true,
    message: "Investment fund updated successfully",
    data: updatedFund,
  });
});

exports.deleteInvestmentFund = asyncHandler(async (req, res, next) => {
  const fund = await investmentFundsModel.findByIdAndDelete(req.params.id);

  if (!fund) {
    return next(
      new ApiError(`No Investment Fund found for this id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    message: "Investment fund deleted successfully",
  });
});
