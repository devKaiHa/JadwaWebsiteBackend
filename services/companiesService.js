const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const companiesModel = require("../models/Companies");
const { uploadMixOfImages } = require("../middlewares/uploadingImage");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const buildSlug = require("../utils/buildSlug");
const safeParseJSON = require("../utils/safeParseJson");

exports.uploadCompaniesImages = uploadMixOfImages([
  { name: "logo", maxCount: 1 },
  { name: "background", maxCount: 1 },
]);

exports.resizeCompaniesImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.logo?.[0]) {
    const logoFilename = `company-logo-${uuidv4()}-${Date.now()}.webp`;

    await sharp(req.files.logo[0].buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/companies/${logoFilename}`);

    req.body.logo = logoFilename;
  }

  if (req.files.background?.[0]) {
    const backgroundFilename = `company-background-${uuidv4()}-${Date.now()}.webp`;

    await sharp(req.files.background[0].buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/companies/${backgroundFilename}`);

    req.body.background = backgroundFilename;
  }

  next();
});

const parseCompanyBody = (body) => {
  if (body.name !== undefined) body.name = safeParseJSON(body.name, "name");
  if (body.about !== undefined) body.about = safeParseJSON(body.about, "about");
  if (body.experienceField !== undefined) {
    body.experienceField = safeParseJSON(
      body.experienceField,
      "experienceField",
    );
  }
  if (body.content !== undefined) {
    body.content = safeParseJSON(body.content, "content");
  }
  if (body.social_links !== undefined) {
    body.social_links = safeParseJSON(body.social_links, "social_links");
  }
  if (body.services !== undefined) {
    body.services = safeParseJSON(body.services, "services");
  }
  if (body.values !== undefined) {
    body.values = safeParseJSON(body.values, "values");
  }
  if (body.addresses !== undefined) {
    body.addresses = safeParseJSON(body.addresses, "addresses");
  }
  if (body.goals !== undefined) {
    body.goals = safeParseJSON(body.goals, "goals");
  }
  if (body.statistics !== undefined) {
    body.statistics = safeParseJSON(body.statistics, "statistics");
  }
  if (body.fundsAssociated !== undefined) {
    body.fundsAssociated = safeParseJSON(
      body.fundsAssociated,
      "fundsAssociated",
    );
  }

  if (body.name) {
    body.slug = buildSlug(body.name);
  }

  if (body.isActive !== undefined) {
    body.isActive = body.isActive === true || body.isActive === "true";
  }
};

exports.createCompany = asyncHandler(async (req, res, next) => {
  parseCompanyBody(req.body);

  const existingCompany = await companiesModel.findOne({
    slug: req.body.slug,
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

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "name.en": { $regex: safeKeyword, $options: "i" } },
      { "name.ar": { $regex: safeKeyword, $options: "i" } },
      { "name.tr": { $regex: safeKeyword, $options: "i" } },
      { "about.en": { $regex: safeKeyword, $options: "i" } },
      { "about.ar": { $regex: safeKeyword, $options: "i" } },
      { "about.tr": { $regex: safeKeyword, $options: "i" } },
      { country: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [companies, total] = await Promise.all([
    companiesModel
      .find(query)
      .populate("fundsAssociated", "title _id image slug")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
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
  const { keyword, country, fundId, page = 1, limit } = req.query;
  const query = { isActive: true };

  if (country?.trim()) {
    query.country = { $regex: country.trim(), $options: "i" };
  }

  if (fundId?.trim()) {
    query.fundsAssociated = fundId.trim();
  }

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();
    query.$or = [
      { "name.en": { $regex: safeKeyword, $options: "i" } },
      { "name.ar": { $regex: safeKeyword, $options: "i" } },
      { "name.tr": { $regex: safeKeyword, $options: "i" } },
      { "about.en": { $regex: safeKeyword, $options: "i" } },
      { "about.ar": { $regex: safeKeyword, $options: "i" } },
      { "about.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = limit ? parseInt(limit, 10) : null;
  const skip = limitNum ? (pageNum - 1) * limitNum : 0;

  let companiesQuery = companiesModel
    .find(query)
    .populate("fundsAssociated", "title _id image slug")
    .sort({ order: 1, createdAt: -1 });

  if (limitNum) {
    companiesQuery = companiesQuery.skip(skip).limit(limitNum);
  }

  const companies = await companiesQuery;
  const response = { status: true, data: companies };

  if (limitNum) {
    const total = await companiesModel.countDocuments(query);
    response.pagination = {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    };
  }

  res.status(200).json(response);
});

exports.getCompanyBySlug = asyncHandler(async (req, res, next) => {
  const company = await companiesModel
    .findOne({ slug: req.params.slug, isActive: true })
    .populate("fundsAssociated", "title _id image slug");

  if (!company) {
    return next(new ApiError(`No company found for slug ${req.params.slug}`, 404));
  }

  res.status(200).json({
    status: true,
    data: company,
  });
});

exports.getOneCompany = asyncHandler(async (req, res, next) => {
  const company = await companiesModel
    .findById(req.params.id)
    .populate("fundsAssociated", "title _id image slug");

  if (!company) {
    return next(new ApiError(`No company found for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: company,
  });
});

exports.updateCompany = asyncHandler(async (req, res, next) => {
  parseCompanyBody(req.body);

  const updatedCompany = await companiesModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!updatedCompany) {
    return next(new ApiError(`No company found for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Company updated successfully",
    data: updatedCompany,
  });
});

exports.deleteCompany = asyncHandler(async (req, res, next) => {
  const deletedCompany = await companiesModel.findByIdAndDelete(req.params.id);

  if (!deletedCompany) {
    return next(new ApiError(`No company found for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Company deleted successfully",
  });
});
