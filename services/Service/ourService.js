const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const OurServiceModel = require("../../models/Service/ourServicesModel");

// Admin list
exports.getOurServices = asyncHandler(async (req, res) => {
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

  const [services, total] = await Promise.all([
    OurServiceModel.find(query).sort(sort).skip(skip).limit(limitNum),
    OurServiceModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    status: true,
    message:
      services.length > 0
        ? "Services fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages,
      currentPage: pageNum,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
    data: services,
  });
});

// Public list
exports.getPublicOurServices = asyncHandler(async (req, res) => {
  const services = await OurServiceModel.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: services,
  });
});

exports.createOurService = asyncHandler(async (req, res) => {
  const service = await OurServiceModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Service created successfully",
    data: service,
  });
});

exports.getOneOurService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const service = await OurServiceModel.findById(id);

  if (!service) {
    return next(new ApiError(`No Service found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: service,
  });
});

exports.updateOurService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedService = await OurServiceModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedService) {
    return next(new ApiError(`No Service found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Service updated successfully",
    data: updatedService,
  });
});

exports.deleteOurService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const service = await OurServiceModel.findByIdAndDelete(id);

  if (!service) {
    return next(new ApiError(`No Service found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Service deleted successfully",
  });
});
