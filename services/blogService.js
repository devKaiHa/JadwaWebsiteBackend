const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const blogModel = require("../models/blogModel");
const mongoose = require("mongoose");
const { uploadMixOfImages } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { default: slugify } = require("slugify");
const categoryModel = require("../models/categoryModel");
const safeParseJSON = require("../utils/safeParseJson");

const buildSlug = (name = {}) => {
  const base = name?.en || name?.ar || name?.tr || "";
  return slugify(base, { lower: true, strict: true, trim: true });
};

exports.uploadBlogImages = uploadMixOfImages([
  { name: "image", maxCount: 1 },
  { name: "thumbnailImage", maxCount: 1 },
]);

exports.resizeBlogImages = asyncHandler(async (req, res, next) => {
  if (req.files?.image?.[0]) {
    const imageFilename = `blog-${uuidv4()}-${Date.now()}.webp`;

    await sharp(req.files.image[0].buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/blogs/${imageFilename}`);

    req.body.image = imageFilename;
  }

  if (req.files?.thumbnailImage?.[0]) {
    const thumbnailFilename = `blog-thumb-${uuidv4()}-${Date.now()}.webp`;

    await sharp(req.files.thumbnailImage[0].buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`uploads/blogs/${thumbnailFilename}`);

    req.body.thumbnailImage = thumbnailFilename;
  }

  next();
});

exports.getBlogs = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "-createdAt",
    category,
    published,
  } = req.query;

  const query = {};

  if (keyword?.trim()) {
    const keywordRegex = { $regex: keyword.trim(), $options: "i" };

    query.$or = [
      { "tags.ar": keywordRegex },
      { "tags.en": keywordRegex },
      { "tags.tr": keywordRegex },
      { "title.ar": keywordRegex },
      { "title.en": keywordRegex },
      { "title.tr": keywordRegex },
      { "author.name": keywordRegex },
    ];
  }

  if (published === "true") {
    query.published = true;
  } else if (published === "false") {
    query.published = false;
  }

  if (category) {
    const categoryQuery = { $or: [] };

    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryQuery.$or.push({ _id: category });
    }

    categoryQuery.$or.push(
      { "name.ar": { $regex: category, $options: "i" } },
      { "name.en": { $regex: category, $options: "i" } },
      { "name.tr": { $regex: category, $options: "i" } },
      { slug: { $regex: `^${category}$`, $options: "i" } },
    );

    const foundCategory = await categoryModel.findOne(categoryQuery);

    if (!foundCategory) {
      return res.status(200).json({
        status: true,
        message: "No blogs found for this category",
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          itemsPerPage: parseInt(limit, 10),
        },
      });
    }

    query.category = foundCategory._id;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [blogs, total] = await Promise.all([
    blogModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("category"),
    blogModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      blogs.length > 0 ? "Blogs fetched successfully" : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: blogs,
  });
});

exports.getPublicBlogs = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 10, category } = req.query;

  const query = { published: true };

  if (keyword?.trim()) {
    const keywordRegex = { $regex: keyword.trim(), $options: "i" };

    query.$or = [
      { "tags.ar": keywordRegex },
      { "tags.en": keywordRegex },
      { "tags.tr": keywordRegex },
      { "title.ar": keywordRegex },
      { "title.en": keywordRegex },
      { "title.tr": keywordRegex },
      { "author.name": keywordRegex },
    ];
  }

  if (category) {
    const categoryQuery = { $or: [] };

    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryQuery.$or.push({ _id: category });
    }

    categoryQuery.$or.push(
      { "name.ar": { $regex: category, $options: "i" } },
      { "name.en": { $regex: category, $options: "i" } },
      { "name.tr": { $regex: category, $options: "i" } },
      { slug: { $regex: `^${category}$`, $options: "i" } },
    );

    const foundCategory = await categoryModel.findOne(categoryQuery);

    if (!foundCategory) {
      return res.status(200).json({
        status: true,
        message: "No published blogs found for this category",
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          itemsPerPage: parseInt(limit, 10),
        },
      });
    }

    query.category = foundCategory._id;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [blogs, total] = await Promise.all([
    blogModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("category"),
    blogModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    data: blogs,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

exports.createBlog = asyncHandler(async (req, res) => {
  req.body.title = safeParseJSON(req.body.title, "title");
  req.body.content = safeParseJSON(req.body.content, "content");
  req.body.excerpt = safeParseJSON(req.body.excerpt, "excerpt");
  req.body.tags = safeParseJSON(req.body.tags, "tags");
  req.body.author = safeParseJSON(req.body.author, "author");
  req.body.relatedPosts = safeParseJSON(req.body.relatedPosts, "relatedPosts");

  req.body.slug = buildSlug(req.body.title);

  const blog = await blogModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Blog created successfully",
    data: blog,
  });
});

exports.getOneBlog = asyncHandler(async (req, res, next) => {
  const blog = await blogModel.findById(req.params.id).populate("category");

  if (!blog) {
    return next(new ApiError(`No Blog found for this id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: blog,
  });
});

exports.getBlogBySlug = asyncHandler(async (req, res, next) => {
  const blog = await blogModel
    .findOne({ slug: req.params.slug, published: true })
    .populate("category");

  if (!blog) {
    return next(
      new ApiError(`No published Blog found for slug: ${req.params.slug}`, 404),
    );
  }

  let relatedBlogs = [];

  if (Array.isArray(blog.relatedPosts) && blog.relatedPosts.length > 0) {
    relatedBlogs = await blogModel
      .find({
        _id: { $in: blog.relatedPosts, $ne: blog._id },
        published: true,
      })
      .select("title slug image thumbnailImage excerpt author createdAt")
      .limit(4);
  } else if (blog.category) {
    relatedBlogs = await blogModel
      .find({
        category: blog.category._id,
        published: true,
        _id: { $ne: blog._id },
      })
      .sort({ createdAt: -1 })
      .select("title slug image thumbnailImage excerpt author createdAt")
      .limit(4);
  }

  res.status(200).json({
    status: true,
    data: {
      ...blog.toObject(),
      relatedBlogs,
    },
  });
});

exports.updateBlog = asyncHandler(async (req, res, next) => {
  if (req.body.title !== undefined) {
    req.body.title = safeParseJSON(req.body.title, "title");
  }

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.excerpt !== undefined) {
    req.body.excerpt = safeParseJSON(req.body.excerpt, "excerpt");
  }

  if (req.body.tags !== undefined) {
    req.body.tags = safeParseJSON(req.body.tags, "tags");
  }

  if (req.body.author !== undefined) {
    req.body.author = safeParseJSON(req.body.author, "author");
  }

  if (req.body.relatedPosts !== undefined) {
    req.body.relatedPosts = safeParseJSON(req.body.relatedPosts, "relatedPosts");
  }

  if (req.body.title) {
    req.body.slug = buildSlug(req.body.title);
  }

  const updatedBlog = await blogModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedBlog) {
    return next(new ApiError(`No Blog found for this id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Blog updated successfully",
    data: updatedBlog,
  });
});

exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await blogModel.findByIdAndDelete(req.params.id);

  if (!blog) {
    return next(new ApiError(`No Blog found for this id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Blog deleted successfully",
  });
});

exports.getBlogsByCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findOne({ slug: req.params.slug });

  if (!category) {
    return next(new ApiError(`No category found with slug: ${req.params.slug}`, 404));
  }

  const blogs = await blogModel
    .find({ category: category._id, published: true })
    .sort({ createdAt: -1 })
    .populate("category");

  res.status(200).json({
    status: true,
    count: blogs.length,
    data: blogs,
  });
});
