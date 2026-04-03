const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const companiesModel = require("../models/Companies");
const { uploadMixOfImages } = require("../middlewares/uploadingImage");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const safeParseJSON = (value, fieldName) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }
};

exports.uploadCompaniesImages = uploadMixOfImages([
  { name: "logo", maxCount: 1 },
  { name: "background", maxCount: 1 },
]);

exports.resizeCompaniesImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.logo && req.files.logo[0]) {
    const logoFilename = `company-logo-${uuidv4()}-${Date.now()}.webp`;

    await sharp(req.files.logo[0].buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/companies/${logoFilename}`);

    req.body.logo = logoFilename;
  }

  if (req.files.background && req.files.background[0]) {
    const backgroundFilename = `company-background-${uuidv4()}-${Date.now()}.webp`;

    await sharp(req.files.background[0].buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/companies/${backgroundFilename}`);

    req.body.background = backgroundFilename;
  }

  next();
});

exports.createCompany = asyncHandler(async (req, res, next) => {
  req.body.name = safeParseJSON(req.body.name, "name");
  req.body.about = safeParseJSON(req.body.about, "about");
  req.body.experienceField = safeParseJSON(
    req.body.experienceField,
    "experienceField",
  );
  req.body.content = safeParseJSON(req.body.content, "content");
  req.body.social_links = safeParseJSON(req.body.social_links, "social_links");

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const existingCompany = await companiesModel.findOne({
    "name.en": req.body.name?.en || "",
  });

  if (existingCompany) {
    return next(new ApiError("Company name already exists", 400));
  }

  const newCompany = await companiesModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Company created successfully",
    data: newCompany,
  });
});

exports.getCompanies = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    isActive,
    country,
  } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (country?.trim()) {
    query.country = { $regex: country.trim(), $options: "i" };
  }

  if (keyword && keyword.trim() !== "") {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "name.en": { $regex: safeKeyword, $options: "i" } },
      { "name.ar": { $regex: safeKeyword, $options: "i" } },
      { "name.tr": { $regex: safeKeyword, $options: "i" } },
      { "about.en": { $regex: safeKeyword, $options: "i" } },
      { "about.ar": { $regex: safeKeyword, $options: "i" } },
      { "about.tr": { $regex: safeKeyword, $options: "i" } },
      { "experienceField.en": { $regex: safeKeyword, $options: "i" } },
      { "experienceField.ar": { $regex: safeKeyword, $options: "i" } },
      { "experienceField.tr": { $regex: safeKeyword, $options: "i" } },
      { country: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [companies, total] = await Promise.all([
    companiesModel.find(query).sort(sort).skip(skip).limit(limitNum),
    companiesModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      companies.length > 0
        ? "Companies fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: companies,
  });
});

exports.getPublicCompanies = asyncHandler(async (req, res) => {
  const companies = await companiesModel
    .find({ isActive: true })
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    status: true,
    data: companies,
  });
});

exports.getOneCompany = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const company = await companiesModel.findById(id);

  if (!company) {
    return next(new ApiError(`No company found for this id ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: company,
  });
});

exports.updateCompany = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.name !== undefined) {
    req.body.name = safeParseJSON(req.body.name, "name");
  }

  if (req.body.about !== undefined) {
    req.body.about = safeParseJSON(req.body.about, "about");
  }

  if (req.body.experienceField !== undefined) {
    req.body.experienceField = safeParseJSON(
      req.body.experienceField,
      "experienceField",
    );
  }

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.social_links !== undefined) {
    req.body.social_links = safeParseJSON(
      req.body.social_links,
      "social_links",
    );
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  const updatedCompany = await companiesModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedCompany) {
    return next(new ApiError(`No company found for this id ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Company updated successfully",
    data: updatedCompany,
  });
});

exports.deleteCompany = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedCompany = await companiesModel.findByIdAndDelete(id);

  if (!deletedCompany) {
    return next(new ApiError(`No company found for this id ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Company deleted successfully",
  });
});
