const asyncHandler = require("express-async-handler");
const AboutModel = require("../../models/Service/aboutServiceModel");

exports.getAboutServices = asyncHandler(async (req, res) => {
  let aboutServices = await AboutModel.findOne({ key: "about-services" });

  if (!aboutServices) {
    aboutServices = await AboutModel.create({
      key: "about-services",
      items: [],
    });
  }

  res.status(200).json({
    status: true,
    data: aboutServices,
  });
});

exports.updateAboutServices = asyncHandler(async (req, res) => {
  const updatedAboutServices = await AboutModel.findOneAndUpdate(
    { key: "about-services" },
    { ...req.body, key: "about-services" },
    {
      new: true,
      runValidators: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  res.status(200).json({
    status: true,
    message: "About services saved successfully",
    data: updatedAboutServices,
  });
});
