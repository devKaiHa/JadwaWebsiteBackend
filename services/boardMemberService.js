const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const boardMemberModel = require("../models/boardMemberModel");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { default: slugify } = require("slugify");

const safeParseJSON = (value, fieldName) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }
};

const buildSlug = (name = {}) => {
  const base = name?.en || name?.ar || name?.tr || "";
  return slugify(base, { lower: true, strict: true, trim: true });
};

exports.uploadBoardMemberImage = uploadSingleImage("image");

exports.resizeBoardMemberImages = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `board-member-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/boardMember/${filename}`);

  req.body.image = filename;

  next();
});

// Admin list
exports.getBoardMembers = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    isActive,
    isFounder,
  } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (isFounder !== undefined) {
    query.isFounder = isFounder === "true";
  }

  if (keyword && keyword.trim() !== "") {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "name.ar": { $regex: safeKeyword, $options: "i" } },
      { "name.en": { $regex: safeKeyword, $options: "i" } },
      { "name.tr": { $regex: safeKeyword, $options: "i" } },
      { "position.ar": { $regex: safeKeyword, $options: "i" } },
      { "position.en": { $regex: safeKeyword, $options: "i" } },
      { "position.tr": { $regex: safeKeyword, $options: "i" } },
      { email: { $regex: safeKeyword, $options: "i" } },
      { phone: { $regex: safeKeyword, $options: "i" } },
      { nationality: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [members, total] = await Promise.all([
    boardMemberModel.find(query).sort(sort).skip(skip).limit(limitNum),
    boardMemberModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      members.length > 0
        ? "Board members fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: members,
  });
});

// Public list
exports.getPublicBoardMembers = asyncHandler(async (req, res) => {
  const { isFounder } = req.query;

  const query = { isActive: true };

  if (isFounder !== undefined) {
    query.isFounder = isFounder === "true";
  }

  const members = await boardMemberModel
    .find(query)
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    status: true,
    data: members,
  });
});

exports.createBoardMember = asyncHandler(async (req, res) => {
  req.body.name = safeParseJSON(req.body.name, "name");
  req.body.position = safeParseJSON(req.body.position, "position");
  req.body.bio = safeParseJSON(req.body.bio, "bio");
  req.body.address = safeParseJSON(req.body.address, "address");
  req.body.content = safeParseJSON(req.body.content, "content");

  if (req.body.isFounder !== undefined) {
    req.body.isFounder =
      req.body.isFounder === true || req.body.isFounder === "true";
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  req.body.slug = buildSlug(req.body.name);

  const member = await boardMemberModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Board member created successfully",
    data: member,
  });
});

exports.getOneBoardMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const member = await boardMemberModel.findById(id);

  if (!member) {
    return next(new ApiError(`No Board Member found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: member,
  });
});

exports.getBoardMemberBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const member = await boardMemberModel.findOne({
    slug,
    isActive: true,
  });

  if (!member) {
    return next(
      new ApiError(`No active Board Member found for slug: ${slug}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: member,
  });
});

exports.updateBoardMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.name !== undefined) {
    req.body.name = safeParseJSON(req.body.name, "name");
  }

  if (req.body.position !== undefined) {
    req.body.position = safeParseJSON(req.body.position, "position");
  }

  if (req.body.bio !== undefined) {
    req.body.bio = safeParseJSON(req.body.bio, "bio");
  }

  if (req.body.address !== undefined) {
    req.body.address = safeParseJSON(req.body.address, "address");
  }

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.isFounder !== undefined) {
    req.body.isFounder =
      req.body.isFounder === true || req.body.isFounder === "true";
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.name) {
    req.body.slug = buildSlug(req.body.name);
  }

  const updatedMember = await boardMemberModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedMember) {
    return next(new ApiError(`No Board Member found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Board member updated successfully",
    data: updatedMember,
  });
});

exports.deleteBoardMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const member = await boardMemberModel.findByIdAndDelete(id);

  if (!member) {
    return next(new ApiError(`No Board Member found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Board member deleted successfully",
  });
});
