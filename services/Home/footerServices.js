const asyncHandler = require("express-async-handler");
const footerModel = require("../../models/Home/FooterModel");

exports.getFooter = asyncHandler(async (req, res) => {
  const footer = await footerModel.findOne();

  res.status(200).json({
    status: true,
    message: footer ? "Footer fetched successfully" : "Footer not found",
    data: footer,
  });
});

exports.updateFooter = asyncHandler(async (req, res) => {
  const footer = await footerModel.findOneAndUpdate({}, req.body, {
    new: true,
    runValidators: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  res.status(200).json({
    status: true,
    message: "Footer saved successfully",
    data: footer,
  });
});
