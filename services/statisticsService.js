const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const StatisticsModel = require("../models/statisticsModel");

// Admin list
exports.getStatistics = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 10, sort = "order createdAt" } = req.query;

  const query = {};

  if (keyword && keyword.trim() !== "") {
    query.$or = [
      { "title.ar": { $regex: keyword, $options: "i" } },
      { "title.en": { $regex: keyword, $options: "i" } },
      { "title.tr": { $regex: keyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [stats, total] = await Promise.all([
    StatisticsModel.find(query).sort(sort).skip(skip).limit(limitNum),
    StatisticsModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    data: stats,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

// Public
exports.getPublicStatistics = asyncHandler(async (req, res) => {
  const stats = await StatisticsModel.find({ isActive: true }).sort({
    order: 1,
  });

  res.status(200).json({ status: true, data: stats });
});

exports.createStatistic = asyncHandler(async (req, res) => {
  const stat = await StatisticsModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Statistic created successfully",
    data: stat,
  });
});

exports.getOneStatistic = asyncHandler(async (req, res, next) => {
  const stat = await StatisticsModel.findById(req.params.id);

  if (!stat) {
    return next(new ApiError("Statistic not found", 404));
  }

  res.status(200).json({ status: true, data: stat });
});

exports.updateStatistic = asyncHandler(async (req, res, next) => {
  const stat = await StatisticsModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!stat) {
    return next(new ApiError("Statistic not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Statistic updated successfully",
    data: stat,
  });
});

exports.deleteStatistic = asyncHandler(async (req, res, next) => {
  const stat = await StatisticsModel.findByIdAndDelete(req.params.id);

  if (!stat) {
    return next(new ApiError("Statistic not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Statistic deleted successfully",
  });
});
