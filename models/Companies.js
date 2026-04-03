const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const companiesSchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    logo: { type: String, default: "" },
    background: { type: String, default: "" },
    about: { type: multilingualSchema },
    experienceYears: { type: String, default: "" },
    experienceField: { type: multilingualSchema },
    social_links: {
      xTwitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    content: { type: multilingualSchema },
    country: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("companies", companiesSchema);
