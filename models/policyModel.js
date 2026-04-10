const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const policySchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    slug: { type: String, unique: true, index: true },
    summary: { type: multilingualSchema },
    content: { type: multilingualSchema },
    policyType: {
      type: String,
      enum: ["policy", "privacy", "terms", "cookies"],
      default: "policy",
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("policy", policySchema);
