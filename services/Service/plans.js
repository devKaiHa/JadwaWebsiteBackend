const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const plansModel = require("../../models/Service/plansModel");

// Admin list
exports.getPlans = asyncHandler(async (req, res) => {
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
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [plans, total] = await Promise.all([
    plansModel.find(query).sort(sort).skip(skip).limit(limitNum),
    plansModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    status: true,
    message:
      plans.length > 0 ? "Plans fetched successfully" : "No matching results",
    pagination: {
      totalItems: total,
      totalPages,
      currentPage: pageNum,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
    data: plans,
  });
});

// Public list
exports.getPublicPlans = asyncHandler(async (req, res) => {
  const plans = await plansModel.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: plans,
  });
});

exports.createPlan = asyncHandler(async (req, res) => {
  const plan = await plansModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Plan created successfully",
    data: plan,
  });
});

exports.getOnePlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const plan = await plansModel.findById(id);

  if (!plan) {
    return next(new ApiError(`No Plan found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: plan,
  });
});

exports.updatePlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedPlan = await plansModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPlan) {
    return next(new ApiError(`No Plan found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Plan updated successfully",
    data: updatedPlan,
  });
});

exports.deletePlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const plan = await plansModel.findByIdAndDelete(id);

  if (!plan) {
    return next(new ApiError(`No Plan found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Plan deleted successfully",
  });
});
