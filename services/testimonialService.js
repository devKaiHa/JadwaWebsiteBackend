const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const TestimonialModel = require("../models/testimonialModel");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const safeParseJSON = require("../utils/safeParseJson");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

exports.uploadTestimonialImage = uploadSingleImage("image");

exports.resizeTestimonialImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `testimonial-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/testimonials/${filename}`);

  req.body.image = filename;
  next();
});

exports.getTestimonials = asyncHandler(async (req, res) => {
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
      { name: { $regex: safeKeyword, $options: "i" } },
      { "role.ar": { $regex: safeKeyword, $options: "i" } },
      { "role.en": { $regex: safeKeyword, $options: "i" } },
      { "role.tr": { $regex: safeKeyword, $options: "i" } },
      { "company.ar": { $regex: safeKeyword, $options: "i" } },
      { "company.en": { $regex: safeKeyword, $options: "i" } },
      { "company.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [testimonials, total] = await Promise.all([
    TestimonialModel.find(query).sort(sort).skip(skip).limit(limitNum),
    TestimonialModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    data: testimonials,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

exports.getPublicTestimonials = asyncHandler(async (req, res) => {
  const { featuredOnly } = req.query;
  const query = { isActive: true };

  if (featuredOnly !== undefined) {
    query.isFeatured = featuredOnly === "true";
  }

  const testimonials = await TestimonialModel.find(query).sort({
    isFeatured: -1,
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: testimonials,
  });
});

exports.getOneTestimonial = asyncHandler(async (req, res, next) => {
  const testimonial = await TestimonialModel.findById(req.params.id);

  if (!testimonial) {
    return next(new ApiError("Testimonial not found", 404));
  }

  res.status(200).json({
    status: true,
    data: testimonial,
  });
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  req.body.role = safeParseJSON(req.body.role, "role");
  req.body.company = safeParseJSON(req.body.company, "company");
  req.body.content = safeParseJSON(req.body.content, "content");

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.isFeatured !== undefined) {
    req.body.isFeatured =
      req.body.isFeatured === true || req.body.isFeatured === "true";
  }

  const testimonial = await TestimonialModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Testimonial created successfully",
    data: testimonial,
  });
});

exports.updateTestimonial = asyncHandler(async (req, res, next) => {
  if (req.body.role !== undefined) {
    req.body.role = safeParseJSON(req.body.role, "role");
  }

  if (req.body.company !== undefined) {
    req.body.company = safeParseJSON(req.body.company, "company");
  }

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.isFeatured !== undefined) {
    req.body.isFeatured =
      req.body.isFeatured === true || req.body.isFeatured === "true";
  }

  const testimonial = await TestimonialModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!testimonial) {
    return next(new ApiError("Testimonial not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Testimonial updated successfully",
    data: testimonial,
  });
});

exports.deleteTestimonial = asyncHandler(async (req, res, next) => {
  const testimonial = await TestimonialModel.findByIdAndDelete(req.params.id);

  if (!testimonial) {
    return next(new ApiError("Testimonial not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Testimonial deleted successfully",
  });
});
