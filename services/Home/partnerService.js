const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const partnersModel = require("../../models/Home/partnersModel");
const { uploadSingleImage } = require("../../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

exports.uploadPartnerImage = uploadSingleImage("img");
exports.resizePartnerImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `partner-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/partners/${filename}`);

  req.body.img = filename;
  next();
});

// Admin list
exports.getPartners = asyncHandler(async (req, res) => {
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
    query.title = { $regex: keyword.trim(), $options: "i" };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [partners, total] = await Promise.all([
    partnersModel.find(query).sort(sort).skip(skip).limit(limitNum),
    partnersModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      partners.length > 0
        ? "Partners fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: partners,
  });
});

// Public list
exports.getPublicPartners = asyncHandler(async (req, res) => {
  const partners = await partnersModel
    .find({ isActive: true })
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    status: true,
    data: partners,
  });
});

exports.createPartner = asyncHandler(async (req, res) => {
  if (req.body.isActive !== undefined) {
    req.body.isActive = req.body.isActive === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }
  const partner = await partnersModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Partner created successfully",
    data: partner,
  });
});

exports.getOnePartner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const partner = await partnersModel.findById(id);

  if (!partner) {
    return next(new ApiError(`No Partner found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: partner,
  });
});

exports.updatePartner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError(`No ID provided`, 404));
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive = req.body.isActive === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  const updatedPartner = await partnersModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPartner) {
    return next(new ApiError(`No Partner found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Partner updated successfully",
    data: updatedPartner,
  });
});

exports.deletePartner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const partner = await partnersModel.findByIdAndDelete(id);

  if (!partner) {
    return next(new ApiError(`No Partner found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Partner deleted successfully",
  });
});
