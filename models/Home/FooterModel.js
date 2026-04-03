const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const footerLinks = new mongoose.Schema(
  {
    title: String,
    link: String,
    isActive: { type: Boolean, default: false },
  },
  { _id: false },
);

const footerSchema = new mongoose.Schema(
  {
    description: { type: multilingualSchema },
    links: { type: [footerLinks], default: [] },
    facebook: String,
    instagram: String,
    xTwitter: String,
    linkedin: String,
    phone: String,
    email: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("footer", footerSchema);
