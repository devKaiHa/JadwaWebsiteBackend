const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const PolicyModel = require("../models/policyModel");
const buildSlug = require("../utils/buildSlug");
const safeParseJSON = require("../utils/safeParseJson");

exports.getPolicies = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    isActive,
    policyType,
  } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (policyType?.trim()) {
    query.policyType = policyType.trim();
  }

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();
    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { slug: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [policies, total] = await Promise.all([
    PolicyModel.find(query).sort(sort).skip(skip).limit(limitNum),
    PolicyModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    data: policies,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

exports.getPublicPolicies = asyncHandler(async (req, res) => {
  const { policyType } = req.query;
  const query = { isActive: true };

  if (policyType?.trim()) {
    query.policyType = policyType.trim();
  }

  const policies = await PolicyModel.find(query).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: policies,
  });
});

exports.getPolicyBySlug = asyncHandler(async (req, res, next) => {
  const policy = await PolicyModel.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!policy) {
    return next(new ApiError("Policy not found", 404));
  }

  res.status(200).json({
    status: true,
    data: policy,
  });
});

exports.getOnePolicy = asyncHandler(async (req, res, next) => {
  const policy = await PolicyModel.findById(req.params.id);

  if (!policy) {
    return next(new ApiError("Policy not found", 404));
  }

  res.status(200).json({
    status: true,
    data: policy,
  });
});

exports.createPolicy = asyncHandler(async (req, res) => {
  req.body.title = safeParseJSON(req.body.title, "title");
  req.body.summary = safeParseJSON(req.body.summary, "summary");
  req.body.content = safeParseJSON(req.body.content, "content");
  req.body.slug = buildSlug(req.body.title);

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const policy = await PolicyModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Policy created successfully",
    data: policy,
  });
});

exports.updatePolicy = asyncHandler(async (req, res, next) => {
  if (req.body.title !== undefined) {
    req.body.title = safeParseJSON(req.body.title, "title");
    req.body.slug = buildSlug(req.body.title);
  }

  if (req.body.summary !== undefined) {
    req.body.summary = safeParseJSON(req.body.summary, "summary");
  }

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const policy = await PolicyModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!policy) {
    return next(new ApiError("Policy not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Policy updated successfully",
    data: policy,
  });
});

exports.deletePolicy = asyncHandler(async (req, res, next) => {
  const policy = await PolicyModel.findByIdAndDelete(req.params.id);

  if (!policy) {
    return next(new ApiError("Policy not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Policy deleted successfully",
  });
});
