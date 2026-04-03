const asyncHandler = require("express-async-handler");
const AboutModel = require("../../models/Home/aboutHome");

exports.getAboutHome = asyncHandler(async (req, res, next) => {
  const about = await AboutModel.findOne();

  res.status(200).json({
    status: true,
    message: about ? "About home fetched successfully" : "About home not found",
    data: about,
  });
});

exports.updateAboutHome = asyncHandler(async (req, res, next) => {
  const updatedAbout = await AboutModel.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  res.status(200).json({
    status: true,
    message: "About home saved successfully",
    data: updatedAbout,
  });
});
