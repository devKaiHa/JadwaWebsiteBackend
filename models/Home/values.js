const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const valuesSchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    content: { type: multilingualSchema },
    description: { type: multilingualSchema },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("values", valuesSchema);
