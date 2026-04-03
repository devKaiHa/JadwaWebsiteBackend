const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const blogSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    content: { type: multilingualSchema },
    slug: { type: String, unique: true, index: true },
    image: { type: String, default: "" },
    thumbnailImage: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    published: { type: Boolean, default: false, index: true },
    tags: { type: [multilingualSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("blogs", blogSchema);
