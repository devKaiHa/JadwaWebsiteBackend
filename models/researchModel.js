const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const researchSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    slug: { type: String, unique: true },
    content: { type: multilingualSchema },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("research", researchSchema);
