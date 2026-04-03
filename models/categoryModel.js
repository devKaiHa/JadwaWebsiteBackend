const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const categorySchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    slug: { type: String, unique: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("category", categorySchema);
