const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    title: String,
    img: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("partners", partnerSchema);
