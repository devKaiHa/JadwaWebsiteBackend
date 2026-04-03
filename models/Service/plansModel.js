const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const plansSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    description: { type: multilingualSchema },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("plans", plansSchema);
