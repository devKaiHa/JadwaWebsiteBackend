const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const ValuesModel = require("../../models/Home/values");

// Admin list
exports.getValues = asyncHandler(async (req, res) => {
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
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [values, total] = await Promise.all([
    ValuesModel.find(query).sort(sort).skip(skip).limit(limitNum),
    ValuesModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      values.length > 0 ? "Values fetched successfully" : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: values,
  });
});

// Public list
exports.getPublicValues = asyncHandler(async (req, res) => {
  const values = await ValuesModel.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: values,
  });
});

exports.createValue = asyncHandler(async (req, res) => {
  const value = await ValuesModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Value created successfully",
    data: value,
  });
});

exports.getOneValue = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const value = await ValuesModel.findById(id);

  if (!value) {
    return next(new ApiError(`No Value found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: value,
  });
});

exports.updateValue = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedValue = await ValuesModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedValue) {
    return next(new ApiError(`No Value found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Value updated successfully",
    data: updatedValue,
  });
});

exports.deleteValue = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const value = await ValuesModel.findByIdAndDelete(id);

  if (!value) {
    return next(new ApiError(`No Value found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Value deleted successfully",
  });
});
