const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const homeSliderSchema = new mongoose.Schema(
  {
    sliderType: {
      type: String,
      enum: ["main", "secondary"],
      default: "main",
      index: true,
    },
    title: { type: multilingualSchema },
    description: { type: multilingualSchema },
    btnLink: String,
    img: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("homeSlider", homeSliderSchema);
