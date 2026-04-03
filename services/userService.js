const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");
const UserModel = require("../models/user");

// GET ALL USERS
exports.getUsers = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "-createdAt",
    isActive,
  } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (keyword && keyword.trim() !== "") {
    const safeKeyword = keyword.trim();

    query.$or = [
      { name: { $regex: safeKeyword, $options: "i" } },
      { email: { $regex: safeKeyword, $options: "i" } },
      { phone: { $regex: safeKeyword, $options: "i" } },
      { slug: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    UserModel.find(query).sort(sort).skip(skip).limit(limitNum),
    UserModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      users.length > 0 ? "Users fetched successfully" : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: users,
  });
});

// GET ONE USER
exports.getOneUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);

  if (!user) {
    return next(new ApiError(`No user found for this id ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: user,
  });
});

// CREATE USER
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, isActive } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError("Name, email, and password are required", 400));
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return next(new ApiError("Email already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await UserModel.create({
    name,
    slug: slugify(name, { lower: true, strict: true, trim: true }),
    email,
    phone,
    password: hashedPassword,
    isActive:
      isActive === undefined ? true : isActive === true || isActive === "true",
  });

  res.status(201).json({
    status: true,
    message: "User created successfully",
    data: {
      _id: user._id,
      name: user.name,
      slug: user.slug,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// UPDATE USER
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  const existingUser = await UserModel.findById(id).select("+password");
  if (!existingUser) {
    return next(new ApiError(`No user found for this id ${id}`, 404));
  }

  if (updateData.email && updateData.email !== existingUser.email) {
    const emailExists = await UserModel.findOne({ email: updateData.email });
    if (emailExists) {
      return next(new ApiError("Email already exists", 400));
    }
  }

  if (updateData.name) {
    updateData.slug = slugify(updateData.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  if (updateData.password && updateData.password.trim() !== "") {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  } else {
    delete updateData.password;
  }

  if (updateData.isActive !== undefined) {
    updateData.isActive =
      updateData.isActive === true || updateData.isActive === "true";
  }

  const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

// DELETE USER
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await UserModel.findByIdAndDelete(id);

  if (!user) {
    return next(new ApiError(`No user found for this id ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "User deleted successfully",
  });
});
