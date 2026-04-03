const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const craeteToken = require("../utils/createToken");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");

exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, isActive } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: false,
      message: "Name, email, and password are required",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(401).json({
      status: false,
      message: "This email is already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
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

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password",
  );

  if (!user) {
    return res.status(401).json({
      status: false,
      message: "This email isn't registered on the system",
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      status: false,
      message: "Your account is not active! Contact your supervisor",
    });
  }

  const isPasswordCorrect = await bcrypt.compare(
    req.body.password,
    user.password,
  );

  if (!isPasswordCorrect) {
    return res.status(401).json({
      status: false,
      message: "The email and password doesn't match",
    });
  }

  const token = craeteToken(user._id);

  res.status(200).json({
    status: true,
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
    token,
  });
});

// @desc make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "You're not logged in! Please log in again",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await User.findById(decoded.userid);

  if (!currentUser) {
    return res.status(401).json({
      status: false,
      message: "This user is not registered on the system",
    });
  }

  if (!currentUser.isActive) {
    return res.status(401).json({
      status: false,
      message: "Your account is not active! Contact your supervisor",
    });
  }

  req.user = currentUser;
  next();
});
