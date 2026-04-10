const asyncHandler = require("express-async-handler");
const contactUsModel = require("../models/ContactUs");
const safeParseJSON = require("../utils/safeParseJson");

exports.getContact = asyncHandler(async (req, res) => {
  let contact = await contactUsModel.findOne({});

  if (!contact) {
    contact = await contactUsModel.create({});
  }

  res.status(200).json({
    status: true,
    data: contact,
  });
});

exports.updateContact = asyncHandler(async (req, res) => {
  if (req.body.address !== undefined) {
    req.body.address = safeParseJSON(req.body.address, "address");
  }

  if (req.body.emails !== undefined) {
    req.body.emails = safeParseJSON(req.body.emails, "emails");
  }

  if (req.body.phones !== undefined) {
    req.body.phones = safeParseJSON(req.body.phones, "phones");
  }

  if (req.body.branches !== undefined) {
    req.body.branches = safeParseJSON(req.body.branches, "branches");
  }

  const updatedContact = await contactUsModel.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  res.status(200).json({
    status: true,
    message: "Contact info saved successfully",
    data: updatedContact,
  });
});
