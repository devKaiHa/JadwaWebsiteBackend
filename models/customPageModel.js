const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const customPageSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    slug: { type: String, unique: true },
    content: { type: multilingualSchema },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("customPage", customPageSchema);
