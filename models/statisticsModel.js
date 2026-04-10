const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const statisticsSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    value: { type: String, default: "" }, // "250", "1.2B", "45"
    suffix: { type: multilingualSchema }, // "+", "%", "M", "B"
    description: { type: multilingualSchema },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("statistics", statisticsSchema);
