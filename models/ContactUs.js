const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const ContactSchema = new mongoose.Schema(
  {
    address: { type: multilingualSchema },
    emails: [String],
    phones: [String],
    mapLink: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("contact", ContactSchema);
