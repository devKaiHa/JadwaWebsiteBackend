const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const contactBranchSchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    address: { type: multilingualSchema },
    mapLink: { type: String, default: "" },
    phones: { type: [String], default: [] },
    whatsapp: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const ContactSchema = new mongoose.Schema(
  {
    address: { type: multilingualSchema },
    emails: { type: [String], default: [] },
    phones: { type: [String], default: [] },
    mapLink: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    branches: { type: [contactBranchSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("contact", ContactSchema);
