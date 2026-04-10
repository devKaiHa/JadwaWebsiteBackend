const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const projectsSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    slug: { type: String, unique: true, index: true },
    brief: { type: multilingualSchema },
    image: { type: String, default: "" },
    projectLink: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("projects", projectsSchema);
