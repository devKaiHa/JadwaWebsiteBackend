const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const aboutServiceItemSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    description: { type: multilingualSchema },
    contentTitle: { type: multilingualSchema },
    contentText: {
      ar: { type: [String], default: [] },
      en: { type: [String], default: [] },
      tr: { type: [String], default: [] },
    },
    highlight: { type: multilingualSchema },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const aboutServicesSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "about-services",
      unique: true,
    },
    items: { type: [aboutServiceItemSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("aboutServices", aboutServicesSchema);
