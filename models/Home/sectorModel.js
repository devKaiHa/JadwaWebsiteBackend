const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const sectorSchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    content: { type: multilingualSchema },
    isActive: { type: Boolean, default: true },
    slug: { type: String, default: "" },
    order: { type: Number, default: 0 },
    description: { type: multilingualSchema },
  },
  { timestamps: true },
);

module.exports = mongoose.model("sector", sectorSchema);
