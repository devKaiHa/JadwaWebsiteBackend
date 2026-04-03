const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const contactUsModel = require("../models/ContactUs");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
exports.uploadCompaniesImage = uploadSingleImage("photo");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

// Image processing
exports.resizeContactImages = asyncHandler(async (req, res, next) => {
  const filename = `Contact-${uuidv4()}-${Date.now()}.webp`;
  if (req.file) {
    await sharp(req.file.buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/Contact/${filename}`);

    // Save image into our db
    req.body.photo = filename;
  }

  next();
});

exports.getContact = asyncHandler(async (req, res, next) => {
  try {
    const { keyword, page = 1, limit = 5, sort = "-createdAt" } = req.query;

    const query = {};

    if (keyword && keyword.trim() !== "") {
      query.$or = [{ "title.en": { $regex: keyword, $options: "i" } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contact, total] = await Promise.all([
      contactUsModel.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      contactUsModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: true,
      message:
        contact.length > 0
          ? "Contact information fetched successfully"
          : "No matching results",
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
      },
      data: contact,
    });
  } catch (error) {
    console.error(`Error fetching contact : ${error.message}`);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

exports.createContact = asyncHandler(async (req, res, next) => {
  const Contact = await contactUsModel.create(req.body);
  res.status(201).json({ data: Contact });
});

exports.getOneContact = asyncHandler(async (req, res, next) => {
  const Contact = await contactUsModel.findOne({});
  if (!Contact) {
    contactUsModel.create({});
    return next(new ApiError(`No Contact info found`, 404));
  }
  res.status(200).json({ data: Contact });
});

exports.updateContact = asyncHandler(async (req, res, next) => {
  const updatedContact = await contactUsModel.findOneAndUpdate({}, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedContact) {
    return next(new ApiError(`No Contact info found`, 404));
  }

  res.status(200).json({ data: updatedContact });
});

exports.deleteContact = asyncHandler(async (req, res, next) => {
  const Contact = await contactUsModel.findOneAndDelete({});
  if (!Contact) {
    return next(new ApiError(`No Contact info found`, 404));
  }
  res.status(204).send();
});
