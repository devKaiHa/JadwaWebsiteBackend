const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const HomeSliderModel = require("../../models/Home/homeSlider");
const { uploadSingleImage } = require("../../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

exports.uploadSliderImages = uploadSingleImage("img");
exports.resizeSliderImages = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `slider-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/homeSlider/${filename}`);

  req.body.img = filename;

  next();
});

const safeParseJSON = (value, fieldName) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }
};

exports.getSliders = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    sliderType,
    isActive,
  } = req.query;

  const query = {};

  if (sliderType) query.sliderType = sliderType;
  if (isActive !== undefined) query.isActive = isActive === "true";

  if (keyword && keyword.trim() !== "") {
    query.$or = [
      { "title.ar": { $regex: keyword, $options: "i" } },
      { "title.en": { $regex: keyword, $options: "i" } },
      { "title.tr": { $regex: keyword, $options: "i" } },
      { "description.ar": { $regex: keyword, $options: "i" } },
      { "description.en": { $regex: keyword, $options: "i" } },
      { "description.tr": { $regex: keyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    HomeSliderModel.find(query).sort(sort).skip(skip).limit(limitNum),
    HomeSliderModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    data,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

//For website access
exports.getPublicSliders = asyncHandler(async (req, res) => {
  const { sliderType = "main" } = req.query;

  const sliders = await HomeSliderModel.find({
    sliderType,
    isActive: true,
  }).sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    status: true,
    data: sliders,
  });
});

exports.getOneSlider = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const slider = await HomeSliderModel.findById(id);

  if (!slider) {
    return next(new ApiError(`No Slider found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: slider,
  });
});

exports.createSlider = asyncHandler(async (req, res) => {
  req.body.title = safeParseJSON(req.body.title, "title");
  req.body.description = safeParseJSON(req.body.description, "description");

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  const slider = await HomeSliderModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Slider created successfully",
    data: slider,
  });
});

exports.updateSlider = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.title !== undefined) {
    req.body.title = safeParseJSON(req.body.title, "title");
  }

  if (req.body.description !== undefined) {
    req.body.description = safeParseJSON(req.body.description, "description");
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  const slider = await HomeSliderModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!slider) {
    return next(new ApiError(`No Slider found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Slider updated successfully",
    data: slider,
  });
});

exports.deleteSlider = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const slider = await HomeSliderModel.findByIdAndDelete(id);

  if (!slider) {
    return next(new ApiError(`No Slider found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Slider deleted successfully",
  });
});

exports.updateSliderBulk = asyncHandler(async (req, res) => {
  const { sliderType } = req.query;
  const slides = req.body;

  if (!sliderType) {
    return res.status(400).json({
      status: false,
      message: "sliderType is required",
    });
  }

  if (!Array.isArray(slides)) {
    return res.status(400).json({
      status: false,
      message: "Request body must be an array",
    });
  }

  // existing slides
  const existingSlides = await HomeSliderModel.find({ sliderType });

  const incomingIds = slides.filter((s) => s._id).map((s) => s._id);

  // delete removed
  await HomeSliderModel.deleteMany({
    sliderType,
    _id: { $nin: incomingIds },
  });

  // update/create
  const operations = slides.map((slide) => {
    if (slide._id) {
      return HomeSliderModel.findByIdAndUpdate(slide._id, slide, {
        new: true,
        runValidators: true,
      });
    } else {
      return HomeSliderModel.create({
        ...slide,
        sliderType,
      });
    }
  });

  await Promise.all(operations);

  const updated = await HomeSliderModel.find({ sliderType }).sort({ order: 1 });

  res.status(200).json({
    status: true,
    message: "Slider updated successfully",
    data: updated,
  });
});
