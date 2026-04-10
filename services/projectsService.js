const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ProjectsModel = require("../models/projectModel");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const safeParseJSON = require("../utils/safeParseJson");
const buildSlug = require("../utils/buildSlug");

exports.uploadProjectImage = uploadSingleImage("image");

exports.resizeProjectImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `project-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/projects/${filename}`);

  req.body.image = filename;

  next();
});

exports.getProjects = asyncHandler(async (req, res) => {
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

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { "brief.ar": { $regex: safeKeyword, $options: "i" } },
      { "brief.en": { $regex: safeKeyword, $options: "i" } },
      { "brief.tr": { $regex: safeKeyword, $options: "i" } },
      { projectLink: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [projects, total] = await Promise.all([
    ProjectsModel.find(query).sort(sort).skip(skip).limit(limitNum),
    ProjectsModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      projects.length > 0
        ? "Projects fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: projects,
  });
});

exports.getPublicProjects = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit } = req.query;
  const query = { isActive: true };

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { "brief.ar": { $regex: safeKeyword, $options: "i" } },
      { "brief.en": { $regex: safeKeyword, $options: "i" } },
      { "brief.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = limit ? parseInt(limit, 10) : null;
  const skip = limitNum ? (pageNum - 1) * limitNum : 0;

  let projectsQuery = ProjectsModel.find(query).sort({
    order: 1,
    createdAt: -1,
  });

  if (limitNum) {
    projectsQuery = projectsQuery.skip(skip).limit(limitNum);
  }

  const projects = await projectsQuery;
  const response = { status: true, data: projects };

  if (limitNum) {
    const total = await ProjectsModel.countDocuments(query);
    response.pagination = {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    };
  }

  res.status(200).json(response);
});

exports.getProjectBySlug = asyncHandler(async (req, res, next) => {
  const project = await ProjectsModel.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!project) {
    return next(new ApiError(`No Project found for slug ${req.params.slug}`, 404));
  }

  res.status(200).json({
    status: true,
    data: project,
  });
});

exports.createProject = asyncHandler(async (req, res) => {
  req.body.title = safeParseJSON(req.body.title, "title");
  req.body.brief = safeParseJSON(req.body.brief, "brief");
  req.body.slug = buildSlug(req.body.title);

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  const project = await ProjectsModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Project created successfully",
    data: project,
  });
});

exports.getOneProject = asyncHandler(async (req, res, next) => {
  const project = await ProjectsModel.findById(req.params.id);

  if (!project) {
    return next(new ApiError(`No Project found for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: project,
  });
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  if (req.body.title !== undefined) {
    req.body.title = safeParseJSON(req.body.title, "title");
    req.body.slug = buildSlug(req.body.title);
  }

  if (req.body.brief !== undefined) {
    req.body.brief = safeParseJSON(req.body.brief, "brief");
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive =
      req.body.isActive === true || req.body.isActive === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  const updatedProject = await ProjectsModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProject) {
    return next(
      new ApiError(`No Project found for this id: ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    message: "Project updated successfully",
    data: updatedProject,
  });
});

exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await ProjectsModel.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new ApiError(`No Project found for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Project deleted successfully",
  });
});
