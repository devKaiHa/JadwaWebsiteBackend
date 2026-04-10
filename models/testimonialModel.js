const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    role: { type: multilingualSchema },
    company: { type: multilingualSchema },
    content: { type: multilingualSchema },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("testimonial", testimonialSchema);
